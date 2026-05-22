/**
 * Quick integration test for Supabase corporate_groups table.
 * Run: node scripts/test-corporate-groups-api.mjs
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(root, '.env')
  const text = readFileSync(envPath, 'utf8')
  const env = {}
  text.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  })
  return env
}

const REQUIRED_COLUMNS = [
  'company_name',
  'industry',
  'status',
  'contact_person',
  'contact_email',
  'contact_phone',
  'website',
  'address',
  'city',
  'country',
  'typical_group_size',
  'payment_terms',
  'notes'
]

function pass(msg) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg) {
  console.log(`  ✗ ${msg}`)
}

async function main() {
  console.log('\n=== Honeywell CRM — corporate_groups table test ===\n')

  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    fail('Missing VITE_SUPABASE_URL and keys in .env')
    process.exit(1)
  }

  pass(`Supabase URL: ${url}`)
  pass(`Table: corporate_groups (REST: ${url}/rest/v1/corporate_groups)`)

  const supabase = createClient(url, key)

  const { data: rows, error: fetchError } = await supabase
    .from('corporate_groups')
    .select('*')
    .order('company_name')
    .limit(5)

  if (fetchError) {
    fail(`SELECT corporate_groups: ${fetchError.message}`)
    if (
      fetchError.message.includes('corporate_groups') ||
      fetchError.code === 'PGRST205' ||
      fetchError.message.includes('schema cache')
    ) {
      console.log('\n  → Run in Supabase SQL editor: supabase/fix_corporate_groups.sql')
      console.log('    (or supabase/migrations/20260524_corporate_groups.sql)\n')
    }
    process.exit(1)
  }
  pass(`SELECT * — OK (${rows?.length ?? 0} rows)`)

  console.log('\nColumn checks:')
  let columnFailures = 0
  for (const col of REQUIRED_COLUMNS) {
    const { error } = await supabase.from('corporate_groups').select(col).limit(1)
    if (error) {
      fail(col)
      columnFailures += 1
    } else {
      pass(col)
    }
  }

  const { error: idError } = await supabase.from('corporate_groups').select('id').limit(1)
  if (idError) {
    fail(`id — ${idError.message}`)
    columnFailures += 1
  } else {
    pass('id')
  }

  const testName = `CRM Test Partner ${Date.now()}`
  const { data: inserted, error: insertError } = await supabase
    .from('corporate_groups')
    .insert({
      company_name: testName,
      status: 'Prospect',
      contact_email: 'corp-test@honeywell.test',
      country: 'Cyprus',
      notes: 'Automated test — safe to delete'
    })
    .select()
    .single()

  console.log('\nWrite test:')
  if (insertError) {
    if (insertError.message.includes('row-level security')) {
      pass('INSERT blocked by RLS without login (expected in browser — log in at /admin/login)')
    } else {
      fail(`INSERT: ${insertError.message}`)
    }
  } else {
    pass(`INSERT test id=${inserted?.id} company="${testName}"`)
    if (inserted?.id) {
      const { error: delError } = await supabase.from('corporate_groups').delete().eq('id', inserted.id)
      if (delError) fail(`Cleanup delete: ${delError.message}`)
      else pass('Test row deleted')
    }
  }

  console.log('\n--- Summary ---')
  if (columnFailures > 0) {
    console.log(`${columnFailures} column(s) missing — run supabase/fix_corporate_groups.sql`)
    process.exit(1)
  }
  console.log('corporate_groups table looks good.')
  console.log('Next: /admin/login → Corporate sidebar → Add corporate group\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
