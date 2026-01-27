import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ShoppingList, ShoppingItem } from '../types'
import { supabase, getTelegramUserId } from '../lib/supabase'

interface ListsContextType {
  lists: ShoppingList[]
  loading: boolean
  addList: (name: string) => Promise<void>
  updateList: (id: string, updatedList: ShoppingList) => void
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadLists = async () => {
    try {
      const userId = getTelegramUserId()

      // Fetch lists where user is owner or member
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .or(`owner_id.eq.${userId},id.in.(select list_id from list_members where user_id = ${userId})`)
        .order('created_at', { ascending: false })

      if (listsError) throw listsError

      if (!listsData) {
        setLists([])
        setLoading(false)
        return
      }

      // Fetch items for each list
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

          return {
            id: list.id,
            name: list.name,
            ownerId: list.owner_id,
            items,
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

      // Add to local state
      const newList: ShoppingList = {
        id: data.id,
        name: data.name,
        ownerId: data.owner_id,
        items: [],
        createdAt: data.created_at
      }

      setLists([newList, ...lists])
    } catch (error) {
      console.error('Error adding list:', error)
    }
  }

  const updateList = (id: string, updatedList: ShoppingList) => {
    // Update items in Supabase
    const list = lists.find(l => l.id === id)
    if (!list) return

    // Find changed items
    updatedList.items.forEach(async (item) => {
      const oldItem = list.items.find(i => i.id === item.id)

      if (!oldItem) {
        // New item - insert
        await supabase.from('items').insert({
          id: item.id,
          list_id: id,
          name: item.name,
          quantity: item.quantity,
          is_completed: item.isCompleted,
          added_by: item.addedBy,
          completed_by: item.completedBy
        })
      } else if (oldItem.isCompleted !== item.isCompleted) {
        // Item status changed - update
        await supabase
          .from('items')
          .update({
            is_completed: item.isCompleted,
            completed_by: item.isCompleted ? getTelegramUserId() : null
          })
          .eq('id', item.id)
      }
    })

    // Find deleted items
    list.items.forEach(async (oldItem) => {
      const exists = updatedList.items.find(i => i.id === oldItem.id)
      if (!exists) {
        await supabase.from('items').delete().eq('id', oldItem.id)
      }
    })

    // Update local state immediately for responsiveness
    setLists(lists.map(list => list.id === id ? updatedList : list))
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
