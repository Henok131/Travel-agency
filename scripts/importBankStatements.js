import { importBankFile } from '../src/lib/bankImport/importService.js'
import fs from 'fs'
import path from 'path'

async function bulkImport(directory, accountId) {
  const files = fs.readdirSync(directory)
    .filter(f => f.endsWith('.csv') || f.endsWith('.pdf'))
  console.log(`Found ${files.length} files to import`)
  for (const filename of files) {
    const filepath = path.join(directory, filename)
    const file = new File([fs.readFileSync(filepath)], filename)
    console.log(`\nImporting: ${filename}`)
    try {
      const result = await importBankFile(file, accountId)
      console.log(`✓ Success: ${result.stats.imported} transactions imported`)
    } catch (error) {
      console.error(`✗ Failed: ${error.message}`)
    }
  }
  console.log('\nBulk import complete')
}

// Usage: node scripts/importBankStatements.js /path/to/statements account-uuid
const directory = process.argv[2]
const accountId = process.argv[3]
if (!directory || !accountId) {
  console.error('Usage: node importBankStatements.js <directory> <account-id>')
  process.exit(1)
}
bulkImport(directory, accountId)
