// lib/db/fix-opening-hours.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq, isNull } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

async function fixOpeningHours() {
  console.log('🔧 Fixing opening hours with proper parsing...\n')

  try {
    const client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    // Read CSV
    const csvPath = path.resolve(process.cwd(), 'data', 'roofing_contractors_clean.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`)
      process.exit(1)
    }

    console.log('📄 Reading CSV file...')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    const rows = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    console.log(`📊 Found ${rows.length} rows in CSV`)

    // Find the opening hours column
    const hoursColumn = Object.keys(rows[0]).find(key => 
      key.toLowerCase().includes('opening') || 
      key.toLowerCase().includes('hour')
    ) || 'opening_hours'

    console.log(`📋 Using column: "${hoursColumn}"`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const row of rows) {
      try {
        const name = row.name?.trim()
        const cityName = row.city?.trim()
        const stateName = row.state?.trim()
        const hoursString = row[hoursColumn]?.trim()

        if (!name || !hoursString) {
          skipped++
          continue
        }

        // Find contractor by name
        const contractors = await db
          .select()
          .from(schema.contractors)
          .where(eq(schema.contractors.name, name))
          .limit(1)

        if (contractors.length === 0) {
          // Try by business_name
          const byBusiness = await db
            .select()
            .from(schema.contractors)
            .where(eq(schema.contractors.businessName, name))
            .limit(1)
          
          if (byBusiness.length === 0) {
            skipped++
            continue
          }

          // Parse opening hours with improved parser
          const openingHours = parseOpeningHoursImproved(hoursString)
          
          if (!openingHours) {
            skipped++
            continue
          }

          await db
            .update(schema.contractors)
            .set({
              openingHours: openingHours,
              updatedAt: new Date(),
            })
            .where(eq(schema.contractors.id, byBusiness[0].id))

          console.log(`✅ Updated: ${name}`)
          updated++
          continue
        }

        // Parse opening hours with improved parser
        const openingHours = parseOpeningHoursImproved(hoursString)
        
        if (!openingHours) {
          console.log(`⚠️ Could not parse hours for: ${name}`)
          skipped++
          continue
        }

        await db
          .update(schema.contractors)
          .set({
            openingHours: openingHours,
            updatedAt: new Date(),
          })
          .where(eq(schema.contractors.id, contractors[0].id))

        console.log(`✅ Updated: ${name}`)
        updated++
      } catch (error: any) {
        console.error(`❌ Error: ${row.name}`, error.message)
        errors++
      }
    }

    console.log(`\n✅ Update completed!`)
    console.log(`   - Updated: ${updated}`)
    console.log(`   - Skipped: ${skipped}`)
    console.log(`   - Errors: ${errors}`)

    // Verify
    const withHours = await db
      .select()
      .from(schema.contractors)
      .where(isNull(schema.contractors.openingHours) === false)
    
    console.log(`\n📊 Total contractors with opening hours: ${withHours.length}`)

    await client.end()
  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }
}

// Improved opening hours parser
function parseOpeningHoursImproved(hoursString: string) {
  if (!hoursString) return null
  
  console.log(`\n🔍 Parsing: "${hoursString}"`)
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayMap: Record<string, string> = {
    'mon': 'monday',
    'tue': 'tuesday', 
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday'
  }
  
  const result: any = {}
  
  // Handle "24/7"
  if (hoursString.toLowerCase().includes('24/7') || hoursString.toLowerCase().includes('24-7')) {
    for (const day of days) {
      result[day] = { open: '24/7', close: '24/7' }
    }
    return result
  }
  
  // Handle "Closed"
  if (hoursString.toLowerCase() === 'closed') {
    for (const day of days) {
      result[day] = null
    }
    return result
  }
  
  // Clean up the string
  let cleaned = hoursString
    .replace(/\([^)]*\)/g, '') // Remove parentheses
    .replace(/\[[^\]]*\]/g, '') // Remove brackets
    .replace(/\s+/g, ' ') // Normalize spaces
  
  // Split by commas, semicolons, or "and"
  let parts = cleaned.split(/[,;]| and /).map(p => p.trim()).filter(p => p)
  
  if (parts.length === 0) {
    parts = [cleaned]
  }
  
  console.log(`   📋 Parts: ${parts.length}`)
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase()
    
    // Check if part contains "closed"
    if (lowerPart.includes('closed')) {
      for (const [key, value] of Object.entries(dayMap)) {
        if (lowerPart.includes(key) || lowerPart.includes(value.substring(0, 3))) {
          result[value] = null
          console.log(`      ${value}: Closed`)
          break
        }
      }
      continue
    }
    
    // Look for time patterns
    // Pattern: "9:00 AM - 5:00 PM" or "9 AM - 5 PM" or "9-5"
    const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
    const times = part.match(timePattern)
    
    if (times) {
      console.log(`      Times: ${times[1].trim()} - ${times[2].trim()}`)
      
      // Check for day range like "Mon-Fri"
      const rangePattern = /([A-Za-z]+)\s*[-–—]\s*([A-Za-z]+)/i
      const rangeMatch = part.match(rangePattern)
      
      if (rangeMatch) {
        const startDay = rangeMatch[1].toLowerCase().substring(0, 3)
        const endDay = rangeMatch[2].toLowerCase().substring(0, 3)
        const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const startIdx = dayKeys.findIndex(d => d.startsWith(startDay))
        const endIdx = dayKeys.findIndex(d => d.startsWith(endDay))
        
        if (startIdx >= 0 && endIdx >= 0 && startIdx <= endIdx) {
          for (let i = startIdx; i <= endIdx; i++) {
            result[dayKeys[i]] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            console.log(`      ${dayKeys[i]}: ${times[1]} - ${times[2]}`)
          }
        }
      } else {
        // Check for individual days
        let dayFound = false
        for (const [key, value] of Object.entries(dayMap)) {
          if (lowerPart.includes(key) || lowerPart.includes(value.substring(0, 3))) {
            result[value] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            console.log(`      ${value}: ${times[1]} - ${times[2]}`)
            dayFound = true
            break
          }
        }
        
        // If no specific day found, check for "Daily"
        if (!dayFound && lowerPart.includes('daily')) {
          for (const day of days) {
            result[day] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            console.log(`      ${day}: ${times[1]} - ${times[2]}`)
          }
          dayFound = true
        }
        
        // If still no day found, check for "Weekdays" or "Mon-Fri" style
        if (!dayFound && (lowerPart.includes('weekday') || lowerPart.includes('mon'))) {
          const weekdayDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          for (const day of weekdayDays) {
            result[day] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            console.log(`      ${day}: ${times[1]} - ${times[2]}`)
          }
          dayFound = true
        }
        
        // If still no day found, apply to all days
        if (!dayFound) {
          for (const day of days) {
            result[day] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            console.log(`      ${day}: ${times[1]} - ${times[2]}`)
          }
        }
      }
    } else {
      console.log(`      ⚠️ No times found: "${part}"`)
    }
  }
  
  // Ensure all days exist
  for (const day of days) {
    if (!(day in result)) {
      result[day] = null
    }
  }
  
  // Check if we have any hours
  const hasHours = Object.values(result).some(v => v !== null)
  console.log(`   ✅ Has hours: ${hasHours}`)
  
  return hasHours ? result : null
}

fixOpeningHours()