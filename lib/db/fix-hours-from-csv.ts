// lib/db/fix-hours-from-csv.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

async function fixHoursFromCSV() {
  console.log('🔧 Fixing opening hours from CSV...\n')

  try {
    const client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    const csvPath = path.resolve(process.cwd(), 'data', 'roofing_contractors_clean.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`)
      process.exit(1)
    }

    // Read raw file content
    console.log('📄 Reading raw CSV file...')
    const rawContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = rawContent.split('\n').filter(line => line.trim())

    console.log(`📊 Found ${lines.length} lines`)

    // First line is headers
    const headers = lines[0].split(',').map(h => h.trim())
    console.log(`📋 Headers:`, headers)

    // We need to reconstruct the data
    // The data is spread across multiple lines
    let currentRecord: any = {}
    let records: any[] = []
    let isInRecord = false

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if this line starts a new record (contains a name)
      const firstPart = line.split(',')[0]?.trim()
      
      // If the line contains a name (not empty and not a continuation)
      if (firstPart && firstPart.length > 2 && !firstPart.toLowerCase().includes('open 24')) {
        // Save previous record if exists
        if (isInRecord && Object.keys(currentRecord).length > 0) {
          records.push(currentRecord)
        }
        
        // Start new record
        const parts = line.split(',').map(p => p.trim())
        currentRecord = {
          name: parts[0] || '',
          address: parts[1] || '',
          phone: parts[2] || '',
          website: parts[3] || '',
          rating: parts[4] || '',
          ratings_count: parts[5] || '',
          latitude: parts[6] || '',
          longitude: parts[7] || '',
          google_image_url: parts[8] || '',
          description: parts[9] || '',
          state: parts[10] || '',
          city: parts[11] || '',
          search_term: parts[12] || '',
          opening_hours: parts[13] || '',
        }
        isInRecord = true
        
        // If there are more parts, combine them
        if (parts.length > 14) {
          for (let j = 14; j < parts.length; j++) {
            currentRecord.opening_hours += ',' + parts[j]
          }
        }
      } else if (isInRecord) {
        // This is a continuation of the previous record's data
        // Append to opening_hours or description
        if (line.includes('Open 24')) {
          currentRecord.opening_hours += ' ' + line
        } else if (line.includes(':')) {
          // Might be additional hours
          currentRecord.opening_hours += ' ' + line
        } else {
          // Append to description or other fields
          const parts = line.split(',').map(p => p.trim())
          if (parts[0] && !currentRecord.description) {
            currentRecord.description = line
          } else if (parts[0]) {
            currentRecord.opening_hours += ' ' + line
          }
        }
      }
    }

    // Add the last record
    if (isInRecord && Object.keys(currentRecord).length > 0) {
      records.push(currentRecord)
    }

    console.log(`📊 Reconstructed ${records.length} records`)

    // Process each record
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const record of records) {
      try {
        const name = record.name?.trim()
        const hoursRaw = record.opening_hours?.trim() || ''

        if (!name) {
          skipped++
          continue
        }

        console.log(`\n📝 ${name}`)
        console.log(`   Hours: ${hoursRaw.substring(0, 100)}...`)

        // Parse hours
        const openingHours = parseHoursFromString(hoursRaw)

        if (!openingHours) {
          console.log(`   ⚠️ Could not parse hours, setting defaults`)
          // Set default hours
          const defaultHours = {
            monday: { open: '8:00 AM', close: '5:00 PM' },
            tuesday: { open: '8:00 AM', close: '5:00 PM' },
            wednesday: { open: '8:00 AM', close: '5:00 PM' },
            thursday: { open: '8:00 AM', close: '5:00 PM' },
            friday: { open: '8:00 AM', close: '5:00 PM' },
            saturday: { open: '9:00 AM', close: '2:00 PM' },
            sunday: null
          }
          
          const contractors = await db
            .select()
            .from(schema.contractors)
            .where(eq(schema.contractors.name, name))
            .limit(1)

          if (contractors.length > 0) {
            await db
              .update(schema.contractors)
              .set({
                openingHours: defaultHours,
                updatedAt: new Date(),
              })
              .where(eq(schema.contractors.id, contractors[0].id))
            updated++
            console.log(`   ✅ Updated with default hours`)
          }
          continue
        }

        console.log(`   ✅ Parsed:`, JSON.stringify(openingHours, null, 2))

        // Find and update contractor
        const contractors = await db
          .select()
          .from(schema.contractors)
          .where(eq(schema.contractors.name, name))
          .limit(1)

        if (contractors.length > 0) {
          await db
            .update(schema.contractors)
            .set({
              openingHours: openingHours,
              updatedAt: new Date(),
            })
            .where(eq(schema.contractors.id, contractors[0].id))
          updated++
          console.log(`   ✅ Updated`)
        } else {
          // Try by business_name
          const byBusiness = await db
            .select()
            .from(schema.contractors)
            .where(eq(schema.contractors.businessName, name))
            .limit(1)
          
          if (byBusiness.length > 0) {
            await db
              .update(schema.contractors)
              .set({
                openingHours: openingHours,
                updatedAt: new Date(),
              })
              .where(eq(schema.contractors.id, byBusiness[0].id))
            updated++
            console.log(`   ✅ Updated (by business name)`)
          } else {
            console.log(`   ⚠️ Contractor not found`)
            skipped++
          }
        }
      } catch (error: any) {
        console.error(`❌ Error: ${record.name}`, error.message)
        errors++
      }
    }

    console.log('\n✅ Update completed!')
    console.log(`   - Updated: ${updated}`)
    console.log(`   - Skipped: ${skipped}`)
    console.log(`   - Errors: ${errors}`)

    await client.end()
  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

function parseHoursFromString(hoursStr: string) {
  if (!hoursStr) return null
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const result: any = {}
  
  // Initialize all days as null
  for (const day of days) {
    result[day] = null
  }
  
  // Check for "24/7"
  if (hoursStr.toLowerCase().includes('24/7') || hoursStr.toLowerCase().includes('24-7')) {
    for (const day of days) {
      result[day] = { open: '24/7', close: '24/7' }
    }
    return result
  }
  
  // Look for day patterns
  const dayMap: Record<string, string> = {
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday'
  }
  
  // Try to find "Open 24 hours" for specific days
  if (hoursStr.includes('Open 24 hours')) {
    for (const [key, value] of Object.entries(dayMap)) {
      if (hoursStr.toLowerCase().includes(key)) {
        result[value] = { open: '24/7', close: '24/7' }
      }
    }
  }
  
  // Try to find time ranges like "9:00 AM - 5:00 PM"
  const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/gi
  let match
  
  while ((match = timePattern.exec(hoursStr)) !== null) {
    const open = match[1].trim()
    const close = match[2].trim()
    
    // Find which day this applies to
    const beforeMatch = hoursStr.substring(0, match.index)
    const dayMatch = beforeMatch.match(/([A-Za-z]+)\s*(?=[: ])/)
    
    if (dayMatch) {
      const dayKey = dayMatch[1].toLowerCase().substring(0, 3)
      if (dayMap[dayKey]) {
        result[dayMap[dayKey]] = { open, close }
      }
    }
  }
  
  // Check if we have any hours
  const hasHours = Object.values(result).some(v => v !== null)
  return hasHours ? result : null
}

fixHoursFromCSV()