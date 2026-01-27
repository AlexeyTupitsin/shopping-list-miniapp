import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', {
  url: supabaseUrl ? '✅ Present' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Present' : '❌ Missing'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get Telegram user ID
export function getTelegramUserId(): number {
  const tg = window.Telegram?.WebApp

  // In development/testing, return a mock user ID
  if (!tg?.initData) {
    return 123456789
  }

  // Parse initData to get user_id
  try {
    const params = new URLSearchParams(tg.initData)
    const userJson = params.get('user')
    if (userJson) {
      const user = JSON.parse(userJson)
      return user.id
    }
  } catch (error) {
    console.error('Failed to parse Telegram user data:', error)
  }

  return 0
}

// Load user information by user IDs
export async function getUsersByIds(userIds: number[]): Promise<Map<number, { firstName: string; lastName?: string; username?: string }>> {
  if (userIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, username')
    .in('id', userIds)

  if (error) {
    console.error('Error fetching users:', error)
    return new Map()
  }

  const usersMap = new Map()
  data?.forEach(user => {
    usersMap.set(user.id, {
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username
    })
  })

  return usersMap
}

// Format user display name
export function formatUserName(user: { firstName: string; lastName?: string; username?: string } | undefined, userId: number): string {
  if (!user) {
    return `User ${userId}`
  }

  if (user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }

  if (user.username) {
    return `${user.firstName} (@${user.username})`
  }

  return user.firstName
}
