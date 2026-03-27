import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './stores/auth.store'
import { initTheme } from './utils/theme'
import './index.css'

initTheme()

// Listen for forced logout from token refresh failures
window.addEventListener('vrum:logout', () => {
  useAuthStore.getState().logout()
  router.navigate('/auth/login')
})

// Initialize auth state before rendering
const { initialize } = useAuthStore.getState()
initialize().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
})
