export interface ShoppingItem {
  id: string
  name: string
  quantity?: string
  isCompleted: boolean
  addedBy: number
  completedBy?: number
  createdAt: string
}

export interface ShoppingList {
  id: string
  name: string
  items: ShoppingItem[]
  ownerId: number
  memberCount: number
  createdAt: string
}

export interface User {
  id: number
  firstName: string
  lastName?: string
  username?: string
}
