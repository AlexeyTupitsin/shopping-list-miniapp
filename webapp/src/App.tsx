import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ListsProvider } from './context/ListsContext'
import ListsPage from './pages/ListsPage'
import ListDetailPage from './pages/ListDetailPage'
import './App.css'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        initData?: string
        MainButton: {
          text: string
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
        }
        showConfirm?: (message: string, callback: (confirmed: boolean) => void) => void
        showPopup?: (params: { title?: string; message: string; buttons?: Array<{ type?: string; text?: string }> }, callback?: (buttonId: string) => void) => void
        themeParams: {
          bg_color?: string
          text_color?: string
          button_color?: string
          button_text_color?: string
        }
      }
    }
  }
}

function App() {
  return (
    <ListsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListsPage />} />
          <Route path="/list/:listId" element={<ListDetailPage />} />
        </Routes>
      </BrowserRouter>
    </ListsProvider>
  )
}

export default App
