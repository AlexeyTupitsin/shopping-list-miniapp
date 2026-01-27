import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types matching our database schema
export interface DbList {
  id: string
  name: string
  owner_id: number
  created_at: string
}

export interface DbItem {
  id: string
  list_id: string
  name: string
  quantity: string | null
  is_completed: boolean
  added_by: number | null
  completed_by: number | null
  created_at: string
}

// Helper functions for common operations
export async function getUserLists(userId: number): Promise<DbList[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lists:', error)
    throw error
  }

  return data || []
}

export async function createList(userId: number, name: string): Promise<DbList> {
  const { data, error } = await supabase
    .from('lists')
    .insert({ name, owner_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error creating list:', error)
    throw error
  }

  // Add owner as a member
  const { error: memberError } = await supabase
    .from('list_members')
    .insert({ list_id: data.id, user_id: userId })

  if (memberError) {
    console.error('Error adding owner as member:', memberError)
    // Don't throw - list is created, member addition is optional
  }

  return data
}

export async function getListWithItems(listId: string) {
  // Get list
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single()

  if (listError) {
    console.error('Error fetching list:', listError)
    throw listError
  }

  // Get items
  const { data: items, error: itemsError} = await supabase
    .from('items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
    throw itemsError
  }

  return { list, items: items || [] }
}

export async function addListMember(listId: string, userId: number): Promise<boolean> {
  // Check if list exists
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .single()

  if (listError || !list) {
    console.error('List not found:', listId)
    return false
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('list_members')
    .select('*')
    .eq('list_id', listId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Already a member
    return true
  }

  // Add as member
  const { error } = await supabase
    .from('list_members')
    .insert({ list_id: listId, user_id: userId })

  if (error) {
    console.error('Error adding list member:', error)
    return false
  }

  return true
}
