import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(supabaseUrl && supabaseKey)

const buildConfigError = () => ({
  message: 'Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.'
})

function createMockQueryResponse() {
  return { data: null, error: buildConfigError() }
}

function createMockQueryBuilder() {
  return {
    select() {
      return this
    },
    insert() {
      return this
    },
    update() {
      return this
    },
    delete() {
      return this
    },
    eq() {
      return Promise.resolve(createMockQueryResponse())
    },
    not() {
      return Promise.resolve({ data: [], error: buildConfigError() })
    },
    order() {
      return Promise.resolve({ data: [], error: buildConfigError() })
    },
    single() {
      return Promise.resolve(createMockQueryResponse())
    }
  }
}

function createMockSupabase() {
  const channelObj = {
    on() {
      return channelObj
    },
    subscribe() {
      return channelObj
    }
  }

  return {
    from() {
      return createMockQueryBuilder()
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: buildConfigError() }),
      getUser: async () => ({ data: { user: null }, error: buildConfigError() }),
      signInWithPassword: async () => ({ data: null, error: buildConfigError() }),
      signOut: async () => ({ error: null })
    },
    channel() {
      return channelObj
    },
    removeChannel() {}
  }
}

if (!isConfigured) {
  // Keep the public website running even when admin Supabase env vars are missing in deployment.
  console.warn('Supabase client is running in fallback mode because environment variables are missing.')
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createMockSupabase()
