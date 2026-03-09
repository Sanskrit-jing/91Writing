import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { useDbStore } from './store/dbStore'
import './index.css'

// 初始化数据库
const initApp = async () => {
  try {
    await useDbStore.getState().initDb()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

initApp()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
