import { ShoppingList } from '../types'

export const mockLists: ShoppingList[] = [
  {
    id: '1',
    name: 'Продукты на неделю',
    ownerId: 123456789,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: '1',
        name: 'Молоко',
        quantity: '2 л',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Хлеб',
        quantity: '1 шт',
        isCompleted: true,
        addedBy: 123456789,
        completedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Яйца',
        quantity: '10 шт',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Масло сливочное',
        quantity: '200 г',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Сыр',
        quantity: '300 г',
        isCompleted: true,
        addedBy: 123456789,
        completedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Помидоры',
        quantity: '1 кг',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: '2',
    name: 'К празднику',
    ownerId: 123456789,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: '7',
        name: 'Шампанское',
        quantity: '2 бутылки',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '8',
        name: 'Торт',
        quantity: '1 шт',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '9',
        name: 'Свечи',
        quantity: '20 шт',
        isCompleted: true,
        addedBy: 123456789,
        completedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: '3',
    name: 'Хозтовары',
    ownerId: 123456789,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: '10',
        name: 'Мыло',
        quantity: '3 шт',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
      {
        id: '11',
        name: 'Стиральный порошок',
        quantity: '1 кг',
        isCompleted: false,
        addedBy: 123456789,
        createdAt: new Date().toISOString(),
      },
    ],
  },
]

// Для обратной совместимости
export const mockList = mockLists[0]
