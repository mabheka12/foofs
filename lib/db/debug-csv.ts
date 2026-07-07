// lib/db/debug-csv.ts
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const csvPath = path.resolve(process.cwd(), 'data', 'roofing_contractors_clean.csv')

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found at: ${csvPath}`)
  process.exit(1)
}

console.log('📄 Reading CSV file...')
const fileContent = fs.readFileSync(csvPath, 'utf-8')

console.log('\n📋 RAW CSV CONTENT (first 10 lines):')
const lines = fileContent.split('\n').slice(0, 10)
lines.forEach((line, i) => {
  console.log(`Line ${i + 1}: ${line}`)
})

// Parse and show structure
console.log('\n🔍 Parsing CSV structure...')
const rows = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as Array<Record<string, string>>

console.log(`\n📊 Found ${rows.length} rows`)

if (rows.length > 0) {
  console.log('\n📋 Column headers:', Object.keys(rows[0]))
  console.log('\n📋 First 3 rows:')
  rows.slice(0, 3).forEach((row: any, index: number) => {
    console.log(`\nRow ${index + 1}:`, row)
  })
  
  // Check for missing data
  console.log('\n🔍 Checking for missing required fields...')
  let missingCount = 0
  rows.forEach((row: any, index: number) => {
    const hasName = row.name && row.name.trim()
    const hasCity = row.city && row.city.trim()
    const hasState = row.state_region && row.state_region.trim()
    
    if (!hasName || !hasCity || !hasState) {
      missingCount++
      console.log(`\n⚠️ Row ${index + 1} missing required data:`)
      console.log(`  name: "${row.name}" ${hasName ? '✅' : '❌'}`)
      console.log(`  city: "${row.city}" ${hasCity ? '✅' : '❌'}`)
      console.log(`  state_region: "${row.state_region}" ${hasState ? '✅' : '❌'}`)
      console.log(`  Full row:`, row)
    }
  })
  
  console.log(`\n📊 Total missing rows: ${missingCount}/${rows.length}`)
}