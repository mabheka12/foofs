// lib/db/import-contractors.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { eq, and } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

// Load .env file
config({ path: resolve(process.cwd(), '.env') })

console.log('📁 Loading environment...')
console.log('📂 Current directory:', process.cwd())
console.log('📄 .env file path:', resolve(process.cwd(), '.env'))
console.log('🔑 DATABASE_URL set:', !!process.env.DATABASE_URL)

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set in .env')
  console.log('\n💡 Please check:')
  console.log('   1. .env file exists in project root')
  console.log('   2. DATABASE_URL is defined in .env')
  console.log('   3. No extra spaces or quotes in DATABASE_URL')
  process.exit(1)
}

// State mapping for faster lookups
const STATE_MAP: Record<string, string> = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
}

interface ContractorRow {
  name: string
  city: string
  state_region: string
  country: string
  address: string
  phone: string
  website: string
  rating: string
  review_count: string
  latitude: string
  longitude: string
  keyword: string
  scraped_date: string
}

async function importContractors() {
  console.log('\n🚀 Starting contractor import...\n')

  try {
    const client = postgres(databaseUrl as string, {
      ssl: { rejectUnauthorized: false }
    })
    
    const db = drizzle(client, { schema })

    // 1. Read and parse CSV file
    const csvPath = path.resolve(process.cwd(), 'data', 'contractors.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`)
      console.log('💡 Please place your CSV file at: data/contractors.csv')
      process.exit(1)
    }

    console.log('📄 Reading CSV file...')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const rows: ContractorRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    console.log(`📊 Found ${rows.length} contractors to import\n`)

    // 2. Get all states and cities from database for lookup
    console.log('📦 Loading existing states and cities...')
    const allStates = await db.select().from(schema.states)
    const allCities = await db.select().from(schema.cities)
    
    // Create lookup maps
    const stateMap = new Map(allStates.map(s => [s.name, s]))
    const cityMap = new Map()
    
    // Index cities by state_id and name
    for (const city of allCities) {
      const key = `${city.stateId}-${city.name}`
      cityMap.set(key, city)
    }

    console.log(`✅ Loaded ${allStates.length} states and ${allCities.length} cities\n`)

    // 3. Process each row
    let imported = 0
    let skipped = 0
    let errors = 0

    for (const row of rows) {
      try {
        // Skip if no name
        if (!row.name || !row.city || !row.state_region) {
          console.log(`⚠️ Skipping row: Missing name, city, or state`)
          skipped++
          continue
        }

        // Find state
        const stateName = row.state_region.trim()
        const state = stateMap.get(stateName)
        
        if (!state) {
          console.log(`⚠️ State not found: "${stateName}"`)
          skipped++
          continue
        }

        // Find or create city
        const cityName = row.city.trim()
        const cityKey = `${state.id}-${cityName}`
        let city = cityMap.get(cityKey)

        if (!city) {
          console.log(`📝 Creating new city: ${cityName}, ${stateName}`)
          
          // Create city
          const [newCity] = await db.insert(schema.cities).values({
            name: cityName,
            slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            stateId: state.id,
            latitude: row.latitude || null,
            longitude: row.longitude || null,
            metaTitle: `Roof Leak Repair in ${cityName}`,
            metaDescription: `Find the best roof leak repair contractors in ${cityName}, ${stateName}.`,
          }).returning()
          
          city = newCity
          cityMap.set(cityKey, city)
        }

        // Generate slug from business name
        const slug = row.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // Check if contractor already exists
        const existingContractors = await db
          .select()
          .from(schema.contractors)
          .where(
            and(
              eq(schema.contractors.cityId, city.id),
              eq(schema.contractors.slug, slug)
            )
          )
          .limit(1)

        if (existingContractors.length > 0) {
          // Update existing contractor
          console.log(`🔄 Updating contractor: ${row.name}`)
          await db
            .update(schema.contractors)
            .set({
              name: row.name,
              businessName: row.name,
              address: row.address || null,
              phone: row.phone || null,
              website: row.website || null,
              rating: row.rating?.trim() ? row.rating : null,
              reviewCount: parseInt(row.review_count) || 0,
              updatedAt: new Date(),
              published: true,
              verified: true,
            })
            .where(eq(schema.contractors.id, existingContractors[0].id))
          
          imported++
        } else {
          // Create new contractor
          console.log(`📝 Creating contractor: ${row.name}`)
          await db.insert(schema.contractors).values({
            name: row.name,
            slug: slug,
            businessName: row.name,
            address: row.address || null,
            cityId: city.id,
            stateId: state.id,
            phone: row.phone || null,
            website: row.website || null,
            rating: row.rating?.trim() ? row.rating : null,
            reviewCount: parseInt(row.review_count) || 0,
            published: true,
            verified: true,
            // Set default services based on keyword
            servicesOffered: detectServices(row.keyword),
          })
          
          imported++
        }
      } catch (error: any) {
        console.error(`❌ Error processing row for: ${row.name}`, error.message)
        errors++
      }
    }

    console.log('\n✅ Import completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Imported/Updated: ${imported} contractors`)
    console.log(`   - Skipped: ${skipped} rows`)
    console.log(`   - Errors: ${errors} errors`)

    await client.end()
  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Helper function to detect services from keyword
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
  
  // Default if nothing matched
  if (services.length === 0) {
    services.push('Roof Leak Repair', 'Roof Inspection')
  }
  
  return services
}

importContractors()