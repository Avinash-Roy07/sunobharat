import './index.css'
import App from './App.jsx'
import Admin from './pages/Admin.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const path = window.location.pathname
const isAdmin = path === '/xb7k2-control-9f3m'

createRoot(document.getElementById('root')).render(
  <StrictMode>{isAdmin ? <Admin /> : <App />}</StrictMode>
)
