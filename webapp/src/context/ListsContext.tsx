import { createContext, useContext, useState, ReactNode } from 'react'
import { ShoppingList } from '../types'
import { mockLists } from '../data/mockData'

interface ListsContextType {
  lists: ShoppingList[]
  addList: (list: ShoppingList) => void
  updateList: (id: string, updatedList: ShoppingList) => void
  deleteList: (id: string) => void
  getListById: (id: string) => ShoppingList | undefined
}

const ListsContext = createContext<ListsContextType | undefined>(undefined)

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>(mockLists)

  const addList = (list: ShoppingList) => {
    setLists([list, ...lists])
  }

  const updateList = (id: string, updatedList: ShoppingList) => {
    setLists(lists.map(list => list.id === id ? updatedList : list))
  }

  const deleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id))
  }

  const getListById = (id: string) => {
    return lists.find(list => list.id === id)
  }

  return (
    <ListsContext.Provider value={{ lists, addList, updateList, deleteList, getListById }}>
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
