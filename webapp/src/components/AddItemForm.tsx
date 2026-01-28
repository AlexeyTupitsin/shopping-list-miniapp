import { useState } from 'react'
import './AddItemForm.css'

interface AddItemFormProps {
  onAdd: (name: string, quantity?: string) => void
  onClose: () => void
}

export default function AddItemForm({ onAdd, onClose }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [addedCount, setAddedCount] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // Поддержка добавления нескольких товаров через запятую
      const items = name.split(',').map(item => item.trim()).filter(item => item.length > 0)

      items.forEach(item => {
        onAdd(item, quantity.trim() || undefined)
      })

      setAddedCount(prev => prev + items.length)
      setName('')
      setQuantity('')

      // Trigger success haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter добавляет товары и очищает поле, но не закрывает форму
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (name.trim()) {
        const items = name.split(',').map(item => item.trim()).filter(item => item.length > 0)
        items.forEach(item => {
          onAdd(item, quantity.trim() || undefined)
        })
        setAddedCount(prev => prev + items.length)
        setName('')
        // Не сбрасываем количество - может пригодиться для следующих товаров

        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
        }
      }
    }
  }

  return (
    <div className="add-item-overlay" onClick={onClose}>
      <div className="add-item-form" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить товар</h2>
        {addedCount > 0 && (
          <div className="added-count">
            ✓ Добавлено: {addedCount}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-name">Название товара</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Молоко, Хлеб, Яйца"
              autoFocus
              required
            />
            <span className="input-hint">Можно ввести несколько через запятую</span>
          </div>

          <div className="form-group">
            <label htmlFor="item-quantity">Количество (необязательно)</label>
            <input
              id="item-quantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Например: 2 л"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-add" disabled={!name.trim()}>
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
