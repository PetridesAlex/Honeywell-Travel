/**
 * Quick test for team hub tables.
 * Run: node scripts/test-team-hub-api.mjs
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const text = readFileSync(resolve(root, '.env'), 'utf8')
  const env = {}
  text.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  })
  return env
}

async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(url, key)

  console.log('\n=== Team hub tables test ===\n')

  for (const table of ['team_tasks', 'team_updates', 'team_task_comments']) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.log(`✗ ${table}: ${error.message}`)
    } else {
      console.log(`✓ ${table} exists`)
    }
  }

  console.log('\nIf missing, run in Supabase SQL editor:')
  console.log('  supabase/fix_team_hub.sql\n')
}

main().catch(console.error)
