// UI-only mode: fully mocked Supabase client (no network calls)
const mockResult = (data = []) => Promise.resolve({ data, error: null })

const chain = {
  select: () => chain,
  insert: () => chain,
  update: () => chain,
  delete: () => chain,
  upsert: () => chain,
  single: () => mockResult(null),
  maybeSingle: () => mockResult(null),
  eq: () => chain,
  in: () => chain,
  limit: () => chain,
  order: () => chain,
  range: () => mockResult([]),
  count: () => mockResult({ count: 0 }),
  returns: () => mockResult([])
}

const mockFrom = () => chain

export const supabase = {
  from: mockFrom,
  rpc: () => mockResult([]),
  auth: {
    getSession: () => mockResult({ session: { user: { id: 'dev-user', email: 'dev@local' } } }),
    getUser: () => mockResult({ user: { id: 'dev-user', email: 'dev@local' } }),
    signInWithPassword: () => mockResult({ user: { id: 'dev-user', email: 'dev@local' } }),
    signUp: () => mockResult({ user: { id: 'dev-user', email: 'dev@local' } }),
    signOut: () => mockResult({}),
    resetPasswordForEmail: () => mockResult({}),
    setSession: () => mockResult({ session: { user: { id: 'dev-user', email: 'dev@local' } } }),
    updateUser: () => mockResult({})
  },
  storage: {
    from: () => ({
      list: () => mockResult([]),
      download: () => mockResult(null),
      getPublicUrl: () => ({ data: { publicUrl: '' }, error: null })
    })
  }
}
