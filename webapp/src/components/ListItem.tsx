import { useState, useRef } from 'react'
import { ShoppingItem } from '../types'
import './ListItem.css'

interface ListItemProps {
  item: ShoppingItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function ListItem({ item, onToggle, onDelete }: ListItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef(false)

  const SWIPE_THRESHOLD = 80 // Минимальное расстояние для срабатывания действия
  const MAX_SWIPE = 100 // Максимальный сдвиг

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return

    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current

    // Определяем направление свайпа при первом движении
    if (!isHorizontalSwipe.current && Math.abs(deltaX) > 10) {
      isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY)
    }

    if (isHorizontalSwipe.current) {
      e.preventDefault() // Предотвращаем вертикальный скролл
      const offset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX))
      setSwipeOffset(offset)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)

    if (swipeOffset < -SWIPE_THRESHOLD) {
      // Свайп влево - удалить
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning')
      }
      onDelete(item.id)
    } else if (swipeOffset > SWIPE_THRESHOLD) {
      // Свайп вправо - toggle
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
      }
      onToggle(item.id)
    }

    setSwipeOffset(0)
  }

  const handleCheckboxChange = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    onToggle(item.id)
  }

  const handleDelete = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    }
    onDelete(item.id)
  }

  return (
    <div className="list-item-wrapper">
      {/* Фоновые индикаторы действий */}
      <div className={`swipe-action swipe-action-left ${swipeOffset < -30 ? 'active' : ''}`}>
        <span>🗑️ Удалить</span>
      </div>
      <div className={`swipe-action swipe-action-right ${swipeOffset > 30 ? 'active' : ''}`}>
        <span>{item.isCompleted ? '↩️ Вернуть' : '✓ Купить'}</span>
      </div>

      {/* Основной элемент */}
      <div
        className={`list-item ${item.isCompleted ? 'completed' : ''}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={item.isCompleted}
            onChange={handleCheckboxChange}
          />
          <span className="checkmark"></span>
        </label>

        <div className="item-content">
          <span className="item-name">{item.name}</span>
          {item.quantity && (
            <span className="item-quantity">{item.quantity}</span>
          )}
        </div>

        <button
          className="delete-btn"
          onClick={handleDelete}
          aria-label="Удалить"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
