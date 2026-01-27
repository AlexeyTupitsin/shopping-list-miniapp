import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ListItem from '../components/ListItem'
import AddItemForm from '../components/AddItemForm'
import { useLists } from '../context/ListsContext'
import { ShoppingItem } from '../types'
import { getTelegramUserId, supabase } from '../lib/supabase'
import './ListDetailPage.css'

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { getListById, updateList } = useLists()

  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [members, setMembers] = useState<number[]>([])

  const list = listId ? getListById(listId) : null

  useEffect(() => {
    if (!list) {
      // List not found, redirect to lists page
      navigate('/')
    } else {
      // Load members when list is loaded
      loadMembers()
    }
  }, [list, navigate])

  const loadMembers = async () => {
    if (!listId) return

    const { data, error } = await supabase
      .from('list_members')
      .select('user_id')
      .eq('list_id', listId)

    if (error) {
      console.error('Error loading members:', error)
      return
    }

    setMembers(data?.map(m => m.user_id) || [])
  }

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg && list) {
      tg.ready()
      tg.expand()

      // Set up MainButton
      tg.MainButton.text = 'Добавить товар'
      tg.MainButton.show()

      // Set up BackButton
      tg.BackButton.show()

      const handleMainButtonClick = () => {
        setIsAddFormOpen(true)
      }

      const handleBackButtonClick = () => {
        navigate('/')
      }

      tg.MainButton.onClick(handleMainButtonClick)
      tg.BackButton.onClick(handleBackButtonClick)

      return () => {
        tg.MainButton.hide()
        tg.BackButton.hide()
      }
    }
  }, [list, navigate])

  const handleToggleItem = async (id: string) => {
    if (!list) return

    await updateList(list.id, {
      ...list,
      items: list.items.map((item) =>
        item.id === id
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      ),
    })
  }

  const handleDeleteItem = async (id: string) => {
    if (!list) return

    await updateList(list.id, {
      ...list,
      items: list.items.filter((item) => item.id !== id),
    })
  }

  const handleAddItem = async (name: string, quantity?: string) => {
    if (!list) return

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      isCompleted: false,
      addedBy: getTelegramUserId(),
      createdAt: new Date().toISOString(),
    }

    await updateList(list.id, {
      ...list,
      items: [...list.items, newItem],
    })
  }

  const handleShare = () => {
    if (!list) return

    const tg = window.Telegram?.WebApp
    const botUsername = 'cartmate_app_bot'
    const shareUrl = `https://t.me/${botUsername}?start=list_${list.id}`
    const shareText = `Присоединяйтесь к списку покупок "${list.name}"`

    if (tg?.openTelegramLink) {
      // Use Telegram share
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)
    } else {
      // Fallback: copy to clipboard for browser testing
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(`Ссылка скопирована: ${shareUrl}`)
      })
    }
  }

  if (!list) {
    return (
      <div className="list-detail-page">
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  const activeItems = list.items.filter((item) => !item.isCompleted)
  const completedItems = list.items.filter((item) => item.isCompleted)

  return (
    <div className="list-detail-page">
      <header className="list-detail-header">
        {/* Кнопка назад для локального тестирования */}
        {!window.Telegram?.WebApp?.initData && (
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Назад
          </button>
        )}
        <div className="header-title-row">
          <h1>{list.name}</h1>
          <button className="share-btn" onClick={handleShare} title="Поделиться списком">
            🔗
          </button>
        </div>
        <p className="list-stats">
          {activeItems.length} активных • {completedItems.length} выполнено
        </p>

        {members.length > 0 && (
          <div className="members-section">
            <span className="members-label">
              👥 Участники ({members.length})
            </span>
            <div className="members-list">
              {members.map((userId) => (
                <span key={userId} className="member-badge">
                  {userId}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="list-container">
        {activeItems.length > 0 && (
          <div className="items-section">
            <h2 className="section-title">Нужно купить</h2>
            {activeItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}

        {completedItems.length > 0 && (
          <div className="items-section">
            <h2 className="section-title">Куплено</h2>
            {completedItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}

        {list.items.length === 0 && (
          <div className="empty-state">
            <p>🛒</p>
            <p>Список пуст</p>
            <p className="hint">Добавьте первый товар</p>
          </div>
        )}
      </div>

      {/* Кнопка для локального тестирования (в браузере) */}
      {!window.Telegram?.WebApp?.initData && (
        <button
          className="local-test-btn"
          onClick={() => setIsAddFormOpen(true)}
        >
          + Добавить товар
        </button>
      )}

      {isAddFormOpen && (
        <AddItemForm
          onAdd={handleAddItem}
          onClose={() => setIsAddFormOpen(false)}
        />
      )}
    </div>
  )
}
