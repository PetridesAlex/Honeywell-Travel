/**
 * Quick integration test for Supabase clients table.
 * Run: node scripts/test-clients-api.mjs
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
  'first_name',
  'last_name',
  'email',
  'phone',
  'nationality',
  'date_of_birth',
  'passport_number',
  'date_of_issue',
  'date_of_expiry',
  'notes'
]

function pass(msg) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg) {
  console.log(`  ✗ ${msg}`)
}

async function main() {
  console.log('\n=== Honeywell CRM — clients table test ===\n')

  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    fail('Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SECRET_KEY) in .env')
    process.exit(1)
  }

  if (env.SUPABASE_SECRET_KEY) {
    pass('Using SUPABASE_SECRET_KEY for tests')
  }

  pass(`Supabase URL: ${url}`)
  pass(`Table: clients (REST: ${url}/rest/v1/clients)`)

  const supabase = createClient(url, key)

  // 1. Table exists
  const { data: rows, error: fetchError } = await supabase.from('clients').select('*').limit(5)
  if (fetchError) {
    fail(`fetch clients: ${fetchError.message}`)
    process.exit(1)
  }
  pass(`SELECT * FROM clients — OK (${rows?.length ?? 0} rows returned)`)

  // 2. Column checks (select each column)
  console.log('\nColumn checks:')
  let columnFailures = 0
  for (const col of REQUIRED_COLUMNS) {
    const { error } = await supabase.from('clients').select(col).limit(1)
    if (error) {
      fail(col)
      columnFailures += 1
    } else {
      pass(col)
    }
  }

  // 3. id column
  const { error: idError } = await supabase.from('clients').select('id').limit(1)
  if (idError) {
    fail(`id — ${idError.message} (run migration 20260523_align_clients_id_table.sql)`)
    columnFailures += 1
  } else {
    pass('id')
  }

  // 4. leads.client_id + join
  console.log('\nLeads link:')
  const { error: leadColError } = await supabase.from('leads').select('client_id').limit(1)
  if (leadColError) {
    fail(`leads.client_id — ${leadColError.message} (run migration)`)
  } else {
    pass('leads.client_id column exists')
  }

  const { data: joined, error: joinError } = await supabase
    .from('leads')
    .select('id, client:clients(first_name, last_name, email)')
    .limit(3)

  if (joinError) {
    fail(`leads + clients join — ${joinError.message}`)
  } else {
    pass(`leads + clients join — OK (${joined?.length ?? 0} rows)`)
  }

  // 5. Auth session (admin must log in for writes)
  console.log('\nAuth (writes need logged-in admin):')
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData?.session) {
    pass(`Active session: ${sessionData.session.user.email}`)
  } else {
    pass('No active session in this script (normal — log in via /admin/login in the browser)')
  }

  // 6. Insert test (only works with RLS + authenticated — expect RLS error with anon)
  const testEmail = `crm-test-${Date.now()}@honeywell.test`
  const { data: inserted, error: insertError } = await supabase
    .from('clients')
    .insert({
      first_name: 'Test',
      last_name: 'Client',
      email: testEmail,
      phone: '+35799000000',
      nationality: 'Cypriot',
      passport_number: 'K1234567',
      date_of_issue: '2020-01-15',
      date_of_expiry: '2030-01-15',
      notes: 'Automated test row — safe to delete'
    })
    .select()
    .single()

  if (insertError) {
    if (insertError.message.includes('row-level security')) {
      pass('INSERT blocked by RLS without login (expected — use admin login in browser)')
    } else {
      fail(`INSERT: ${insertError.message}`)
    }
  } else {
    pass(`INSERT test client id=${inserted?.id} email=${testEmail}`)
    if (inserted?.id) {
      const { error: delError } = await supabase.from('clients').delete().eq('id', inserted.id)
      if (delError) fail(`Cleanup delete: ${delError.message}`)
      else pass('Test row deleted')
    }
  }

  console.log('\n--- Summary ---')
  if (columnFailures > 0) {
    console.log(`${columnFailures} column(s) missing — run supabase/migrations/20260523_align_clients_id_table.sql`)
    process.exit(1)
  }
  console.log('Clients table and columns look good.')
  console.log('Next: npm run dev → open http://localhost:5173/admin/login → test Clients page\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
