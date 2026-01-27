import { ShoppingList } from '../types'
import './ListCard.css'

interface ListCardProps {
  list: ShoppingList
  onClick: () => void
  onDelete: () => void
}

export default function ListCard({ list, onClick, onDelete }: ListCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onClick
    onDelete()
  }
  const totalItems = list.items.length
  const completedItems = list.items.filter(item => item.isCompleted).length
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="list-card" onClick={onClick}>
      <div className="list-card-header">
        <h3 className="list-card-title">{list.name}</h3>
        <div className="list-card-actions">
          <span className="list-card-date">{formatDate(list.createdAt)}</span>
          <button
            className="delete-btn"
            onClick={handleDelete}
            title="Удалить список"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="list-card-stats">
        <span className="stat-text">
          {completedItems} из {totalItems} выполнено
        </span>
        {totalItems > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {totalItems === 0 && (
        <p className="list-card-empty">Список пуст</p>
      )}
    </div>
  )
}
