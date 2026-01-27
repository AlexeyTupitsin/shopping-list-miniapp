import { ShoppingItem } from '../types'
import './ListItem.css'

interface ListItemProps {
  item: ShoppingItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function ListItem({ item, onToggle, onDelete }: ListItemProps) {
  const handleCheckboxChange = () => {
    // Trigger haptic feedback if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.impactOccurred('light')
    }
    onToggle(item.id)
  }

  const handleDelete = () => {
    // Trigger haptic feedback if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback?.impactOccurred('medium')
    }
    onDelete(item.id)
  }

  return (
    <div className={`list-item ${item.isCompleted ? 'completed' : ''}`}>
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
  )
}
