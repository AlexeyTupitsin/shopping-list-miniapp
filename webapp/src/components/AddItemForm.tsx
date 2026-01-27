import { useState } from 'react'
import './AddItemForm.css'

interface AddItemFormProps {
  onAdd: (name: string, quantity?: string) => void
  onClose: () => void
}

export default function AddItemForm({ onAdd, onClose }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), quantity.trim() || undefined)
      setName('')
      setQuantity('')
      onClose()

      // Trigger success haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    }
  }

  return (
    <div className="add-item-overlay" onClick={onClose}>
      <div className="add-item-form" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить товар</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-name">Название товара</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Молоко"
              autoFocus
              required
            />
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
