// lib/db/inspect-csv.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

config({ path: resolve(process.cwd(), '.env') })

const csvPath = path.resolve(process.cwd(), 'data', 'roofing_contractors_clean.csv')

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found at: ${csvPath}`)
  process.exit(1)
}

console.log('📄 Reading CSV file...\n')
const fileContent = fs.readFileSync(csvPath, 'utf-8')
const lines = fileContent.split('\n')

// Show headers
console.log('📋 Headers:')
console.log(lines[0])
console.log('\n')

// Show first 10 rows with opening_hours column
console.log('📋 First 10 rows with opening_hours:')
const rows = lines.slice(1, 11)
for (const row of rows) {
  const columns = row.split(',')
  // Try to find the opening_hours column
  const openingHoursIndex = lines[0].toLowerCase().split(',').findIndex(h => 
    h.toLowerCase().includes('opening') || h.toLowerCase().includes('hour')
  )
  
  if (openingHoursIndex !== -1 && columns[openingHoursIndex]) {
    console.log(`   ${columns[openingHoursIndex].trim()}`)
  } else {
    console.log(`   Could not find opening_hours in row`)
    console.log(`   Row: ${row.substring(0, 100)}...`)
  }
}

// Show complete first row with all columns
console.log('\n📋 First complete row:')
if (lines[1]) {
  const columns = lines[1].split(',')
  const headers = lines[0].split(',')
  for (let i = 0; i < Math.min(columns.length, headers.length); i++) {
    console.log(`   ${headers[i].trim()}: ${columns[i]?.trim() || '(empty)'}`)
  }
}