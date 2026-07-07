// lib/db/import-contractors-v2.ts - Updated with better duplicate handling

import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq, and, or, ilike } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  process.exit(1)
}

interface ContractorRow {
  name: string
  address: string
  phone: string
  website: string
  rating: string
  ratings_count: string
  latitude: string
  longitude: string
  google_image_url: string
  description: string
  state: string
  city: string
  search_term: string
  open_hours: string
}

async function importContractorsV2() {
  console.log('🚀 Starting contractor import V2...\n')

  try {
    const client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    // Read CSV
    const csvPath = path.resolve(process.cwd(), 'data', 'roofing_contractors_clean.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`)
      console.log('💡 Please place your CSV at: data/roofing_contractors_clean.csv')
      process.exit(1)
    }

    console.log('📄 Reading CSV file...')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    if (!fileContent.trim()) {
      console.error('❌ CSV file is empty')
      process.exit(1)
    }
    
    const rows: ContractorRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      skip_records_with_error: true,
    })

    console.log(`📊 Found ${rows.length} rows in CSV`)

    // Get all states and cities
    console.log('📦 Loading existing states and cities...')
    const allStates = await db.select().from(schema.states)
    const allCities = await db.select().from(schema.cities)
    
    const stateMap = new Map(allStates.map(s => [s.name.toLowerCase(), s]))
    const cityMap = new Map()
    
    for (const city of allCities) {
      const key = `${city.stateId}-${city.name.toLowerCase()}`
      cityMap.set(key, city)
    }

    console.log(`✅ Loaded ${allStates.length} states and ${allCities.length} cities\n`)

    // Get all existing contractors for duplicate checking
    console.log('📦 Loading existing contractors for duplicate check...')
    const existingContractors = await db.select({
      id: schema.contractors.id,
      name: schema.contractors.name,
      slug: schema.contractors.slug,
      cityId: schema.contractors.cityId,
      stateId: schema.contractors.stateId,
    }).from(schema.contractors)
    
    // Create a map for quick duplicate checking
    const existingMap = new Map()
    for (const c of existingContractors) {
      const key = `${c.stateId}-${c.cityId}-${c.slug}`
      existingMap.set(key, c)
    }
    
    // Also create a name-based map for fuzzy matching
    const nameMap = new Map()
    for (const c of existingContractors) {
      const key = `${c.stateId}-${c.cityId}-${c.name.toLowerCase()}`
      nameMap.set(key, c)
    }

    console.log(`✅ Loaded ${existingContractors.length} existing contractors\n`)

    let imported = 0
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const row of rows) {
      try {
        const name = row.name?.trim()
        const cityName = row.city?.trim()
        const stateName = row.state?.trim()
        const address = row.address?.trim() || null
        const phone = row.phone?.trim() || null
        const website = row.website?.trim() || null
        const rating = row.rating?.trim() || null
        const reviewCount = row.ratings_count?.trim() || null
        const latitude = row.latitude?.trim() || null
        const longitude = row.longitude?.trim() || null
        const parsedRating = rating ? String(parseFloat(rating)) : null
        const keyword = row.search_term?.trim() || row.name?.trim() || ''
        const openingHours = row.open_hours?.trim() || null
        const description = row.description?.trim() || null

        // Skip if missing required fields
        if (!name || !cityName || !stateName) {
          console.log(`⚠️ Skipping row: Missing name, city, or state`)
          skipped++
          continue
        }

        // Find state
        const stateKey = stateName.toLowerCase()
        const state = stateMap.get(stateKey)
        
        if (!state) {
          console.log(`⚠️ State not found: "${stateName}"`)
          skipped++
          continue
        }

        // Find or create city
        const cityKey = `${state.id}-${cityName.toLowerCase()}`
        let city = cityMap.get(cityKey)

        if (!city) {
          console.log(`📝 Creating new city: ${cityName}, ${state.name}`)
          
          const [newCity] = await db.insert(schema.cities).values({
            name: cityName,
            slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            stateId: state.id,
            latitude: latitude || null,
            longitude: longitude || null,
          }).returning()
          
          city = newCity
          cityMap.set(cityKey, city)
        }

        // Generate slug
        let slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        // Check for duplicate by slug
        const duplicateKey = `${state.id}-${city.id}-${slug}`
        let existing = existingMap.get(duplicateKey)
        
        // If not found by slug, try by name
        if (!existing) {
          const nameKey = `${state.id}-${city.id}-${name.toLowerCase()}`
          existing = nameMap.get(nameKey)
        }
        
        // If still not found, try a fuzzy search with ilike
        if (!existing) {
          const fuzzyMatch = await db
            .select()
            .from(schema.contractors)
            .where(
              and(
                eq(schema.contractors.cityId, city.id),
                eq(schema.contractors.stateId, state.id),
                or(
                  ilike(schema.contractors.name, `%${name.substring(0, 20)}%`),
                  ilike(schema.contractors.businessName, `%${name.substring(0, 20)}%`)
                )
              )
            )
            .limit(1)
          
          if (fuzzyMatch.length > 0) {
            existing = fuzzyMatch[0]
          }
        }

        // Parse opening hours
        const openingHoursJson = parseOpeningHours(openingHours)

        if (existing) {
          // UPDATE existing contractor
          console.log(`🔄 Updating: ${name}`)
          await db
            .update(schema.contractors)
            .set({
              name: name,
              businessName: name,
              address: address,
              phone: phone,
              website: website,
              rating: rating ? parseFloat(rating) : null,
              reviewCount: reviewCount ? parseInt(reviewCount) : 0,
              latitude: latitude || null,
              longitude: longitude || null,
              description: description,
              openingHours: openingHoursJson,
              servicesOffered: detectServices(keyword),
              updatedAt: new Date(),
              published: true,
            })
            .where(eq(schema.contractors.id, existing.id))
          
          updated++
        } else {
          // INSERT new contractor - check if slug needs to be unique
          let uniqueSlug = slug
          let counter = 1
          while (existingMap.has(`${state.id}-${city.id}-${uniqueSlug}`)) {
            uniqueSlug = `${slug}-${counter}`
            counter++
          }
          
          console.log(`📝 Importing: ${name}`)
          await db.insert(schema.contractors).values({
            name: name,
            slug: uniqueSlug,
            businessName: name,
            address: address,
            cityId: city.id,
            stateId: state.id,
            phone: phone,
            website: website,
            rating: rating ? parseFloat(rating) : null,
            reviewCount: reviewCount ? parseInt(reviewCount) : 0,
            latitude: latitude || null,
            longitude: longitude || null,
            description: description,
            openingHours: openingHoursJson,
            published: true,
            verified: true,
            servicesOffered: detectServices(keyword),
          })
          
          // Add to map for future checks
          existingMap.set(`${state.id}-${city.id}-${uniqueSlug}`, { id: 'new' })
          imported++
        }
      } catch (error: any) {
        console.error(`❌ Error importing: ${row.name || 'unknown'}`, error.message)
        errors++
      }
    }

    console.log('\n✅ Import completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Imported: ${imported} new contractors`)
    console.log(`   - Updated: ${updated} existing contractors`)
    console.log(`   - Skipped: ${skipped} rows`)
    console.log(`   - Errors: ${errors} errors`)

    await client.end()
  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Helper: Parse opening hours
function parseOpeningHours(hoursString: string) {
  if (!hoursString) return null
  
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
  
  // Parse parts
  let parts = hoursString.split(',').map(p => p.trim())
  if (parts.length === 1 && hoursString.includes(';')) {
    parts = hoursString.split(';').map(p => p.trim())
  }
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase()
    
    if (lowerPart.includes('closed')) {
      for (const [key, value] of Object.entries(dayMap)) {
        if (lowerPart.includes(key) || lowerPart.includes(value.substring(0, 3))) {
          result[value] = null
          break
        }
      }
      continue
    }
    
    const times = part.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/)
    
    if (times) {
      const rangeMatch = part.match(/([A-Za-z]+)\s*-\s*([A-Za-z]+)/)
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
          }
        }
      } else {
        for (const [key, value] of Object.entries(dayMap)) {
          if (lowerPart.includes(key) || lowerPart.includes(value.substring(0, 3))) {
            result[value] = {
              open: times[1].trim(),
              close: times[2].trim()
            }
            break
          }
        }
      }
    }
  }
  
  for (const day of days) {
    if (!(day in result)) {
      result[day] = null
    }
  }
  
  const hasHours = Object.values(result).some(v => v !== null)
  return hasHours ? result : null
}

// Helper: Detect services from keyword
function detectServices(keyword: string): string[] {
  const services: string[] = []
  
  if (!keyword) return ['Roof Leak Repair', 'Roof Inspection']
  
  const k = keyword.toLowerCase()
  
  if (k.includes('emergency') || k.includes('urgent')) {
    services.push('Emergency Roof Repair')
  }
  if (k.includes('inspection') || k.includes('inspect')) {
    services.push('Roof Inspection')
  }
  if (k.includes('repair') || k.includes('fix')) {
    services.push('Roof Leak Repair')
  }
  if (k.includes('replacement') || k.includes('replace')) {
    services.push('Roof Replacement')
  }
  if (k.includes('maintenance') || k.includes('maintain')) {
    services.push('Roof Maintenance')
  }
  
  if (services.length === 0) {
    services.push('Roof Leak Repair', 'Roof Inspection')
  }
  
  return services
}

importContractorsV2()