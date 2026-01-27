import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ShoppingList, ShoppingItem } from '../types'
import { supabase, getTelegramUserId } from '../lib/supabase'

interface ListsContextType {
  lists: ShoppingList[]
  loading: boolean
  addList: (name: string) => Promise<void>
  updateList: (id: string, updatedList: ShoppingList) => Promise<void>
  deleteList: (id: string) => Promise<void>
  getListById: (id: string) => ShoppingList | undefined
}

const ListsContext = createContext<ListsContextType | undefined>(undefined)

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)

  // Load lists from Supabase on mount
  useEffect(() => {
    loadLists()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('lists_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lists' },
        () => {
          loadLists()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => {
          loadLists()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'list_members' },
        () => {
          loadLists()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadLists = async () => {
    try {
      const userId = getTelegramUserId()
      console.log('Loading lists for user:', userId)

      // Fetch lists where user is owner
      const { data: ownerLists, error: ownerError } = await supabase
        .from('lists')
        .select('*')
        .eq('owner_id', userId)

      if (ownerError) {
        console.error('Error fetching owner lists:', ownerError)
        throw ownerError
      }

      // Fetch lists where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('list_members')
        .select('list_id')
        .eq('user_id', userId)

      if (memberError) {
        console.error('Error fetching member lists:', memberError)
        throw memberError
      }

      const memberListIds = memberData?.map(m => m.list_id) || []

      let sharedLists: any[] = []
      if (memberListIds.length > 0) {
        const { data: sharedData, error: sharedError } = await supabase
          .from('lists')
          .select('*')
          .in('id', memberListIds)

        if (sharedError) {
          console.error('Error fetching shared lists:', sharedError)
        } else {
          sharedLists = sharedData || []
        }
      }

      // Combine and deduplicate (in case user is both owner and member)
      const allListsMap = new Map()

      ownerLists?.forEach(list => allListsMap.set(list.id, list))
      sharedLists.forEach(list => allListsMap.set(list.id, list))

      const listsData = Array.from(allListsMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      if (listsData.length === 0) {
        setLists([])
        setLoading(false)
        return
      }

      // Fetch items and members for each list
      const listsWithItems = await Promise.all(
        listsData.map(async (list) => {
          const { data: itemsData } = await supabase
            .from('items')
            .select('*')
            .eq('list_id', list.id)
            .order('created_at', { ascending: true })

          const items: ShoppingItem[] = (itemsData || []).map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            isCompleted: item.is_completed,
            addedBy: item.added_by,
            completedBy: item.completed_by,
            createdAt: item.created_at
          }))

          // Fetch member count
          const { count: memberCount } = await supabase
            .from('list_members')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id)

          return {
            id: list.id,
            name: list.name,
            ownerId: list.owner_id,
            items,
            memberCount: memberCount || 0,
            createdAt: list.created_at
          }
        })
      )

      setLists(listsWithItems)
    } catch (error) {
      console.error('Error loading lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const addList = async (name: string) => {
    try {
      const userId = getTelegramUserId()

      const { data, error } = await supabase
        .from('lists')
        .insert({ name, owner_id: userId })
        .select()
        .single()

      if (error) throw error

      // Add owner as a member
      const { error: memberError } = await supabase
        .from('list_members')
        .insert({ list_id: data.id, user_id: userId })

      if (memberError) {
        console.error('Error adding owner as member:', memberError)
        // Don't throw - list is created, member addition is optional
      }

      // Add to local state
      const newList: ShoppingList = {
        id: data.id,
        name: data.name,
        ownerId: data.owner_id,
        items: [],
        memberCount: 1, // Owner is now a member
        createdAt: data.created_at
      }

      setLists([newList, ...lists])
    } catch (error) {
      console.error('Error adding list:', error)
    }
  }

  const updateList = async (id: string, updatedList: ShoppingList) => {
    // Update local state immediately for responsiveness
    setLists(lists.map(list => list.id === id ? updatedList : list))

    // Update items in Supabase
    const list = lists.find(l => l.id === id)
    if (!list) return

    try {
      // Find changed/new items
      const itemPromises = updatedList.items.map(async (item) => {
        const oldItem = list.items.find(i => i.id === item.id)

        if (!oldItem) {
          // New item - insert
          const { error } = await supabase.from('items').insert({
            id: item.id,
            list_id: id,
            name: item.name,
            quantity: item.quantity,
            is_completed: item.isCompleted,
            added_by: item.addedBy,
            completed_by: item.completedBy
          })
          if (error) {
            console.error('Error inserting item:', error)
            throw error
          }
        } else if (oldItem.isCompleted !== item.isCompleted) {
          // Item status changed - update
          const { error } = await supabase
            .from('items')
            .update({
              is_completed: item.isCompleted,
              completed_by: item.isCompleted ? getTelegramUserId() : null
            })
            .eq('id', item.id)
          if (error) {
            console.error('Error updating item:', error)
            throw error
          }
        }
      })

      // Find deleted items
      const deletePromises = list.items
        .filter(oldItem => !updatedList.items.find(i => i.id === oldItem.id))
        .map(async (oldItem) => {
          const { error } = await supabase.from('items').delete().eq('id', oldItem.id)
          if (error) {
            console.error('Error deleting item:', error)
            throw error
          }
        })

      await Promise.all([...itemPromises, ...deletePromises])
    } catch (error) {
      console.error('Error updating list:', error)
      // Reload from server on error
      await loadLists()
    }
  }

  const deleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLists(lists.filter(list => list.id !== id))
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const getListById = (id: string) => {
    return lists.find(list => list.id === id)
  }

  return (
    <ListsContext.Provider value={{ lists, loading, addList, updateList, deleteList, getListById }}>
      {children}
    </ListsContext.Provider>
  )
}

export function useLists() {
  const context = useContext(ListsContext)
  if (!context) {
    throw new Error('useLists must be used within ListsProvider')
  }
  return context
}
