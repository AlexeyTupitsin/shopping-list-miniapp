import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListCard from '../components/ListCard'
import { useLists } from '../context/ListsContext'
import './ListsPage.css'

export default function ListsPage() {
  const { lists, loading, addList } = useLists()
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()

      // Set up MainButton for creating new list
      tg.MainButton.text = 'Создать список'
      tg.MainButton.show()

      const handleMainButtonClick = () => {
        setIsAddFormOpen(true)
      }

      tg.MainButton.onClick(handleMainButtonClick)

      return () => {
        tg.MainButton.hide()
      }
    }
  }, [])

  const handleListClick = (listId: string) => {
    navigate(`/list/${listId}`)
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newListName.trim()) {
      await addList(newListName.trim())
      setNewListName('')
      setIsAddFormOpen(false)

      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    }
  }

  if (loading) {
    return (
      <div className="lists-page">
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="lists-page">
      <header className="lists-header">
        <h1>Мои списки</h1>
        <p className="lists-subtitle">
          {lists.length} {lists.length === 1 ? 'список' : 'списка'}
        </p>
      </header>

      <div className="lists-container">
        {lists.length === 0 && (
          <div className="empty-state">
            <p>📝</p>
            <p>Нет списков</p>
            <p className="hint">Создайте первый список покупок</p>
          </div>
        )}

        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onClick={() => handleListClick(list.id)}
          />
        ))}
      </div>

      {/* Кнопка для локального тестирования (в браузере) */}
      {!window.Telegram?.WebApp?.initData && (
        <button
          className="local-test-btn"
          onClick={() => setIsAddFormOpen(true)}
        >
          + Создать список
        </button>
      )}

      {isAddFormOpen && (
        <div className="add-list-overlay" onClick={() => setIsAddFormOpen(false)}>
          <div className="add-list-form" onClick={(e) => e.stopPropagation()}>
            <h2>Новый список</h2>
            <form onSubmit={handleCreateList}>
              <div className="form-group">
                <label htmlFor="list-name">Название списка</label>
                <input
                  id="list-name"
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Например: Продукты на неделю"
                  autoFocus
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddFormOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-add"
                  disabled={!newListName.trim()}
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
