import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

/** Redirect to /auth/login if not authenticated */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const me = useAuthStore((s) => s.me)
  const location = useLocation()
  if (!me) return <Navigate to="/auth/login" state={{ from: location }} replace />
  return <>{children}</>
}

/** Redirect to /admin if admin tries to access client area */
export function RequireUser({ children }: { children: React.ReactNode }) {
  const me = useAuthStore((s) => s.me)
  const location = useLocation()
  if (!me) return <Navigate to="/auth/login" state={{ from: location }} replace />
  if (me.role === 'admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

/** Redirect to /cabinet if non-admin tries to access admin area */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const me = useAuthStore((s) => s.me)
  const location = useLocation()
  if (!me) return <Navigate to="/auth/login" state={{ from: location }} replace />
  if (me.role !== 'admin') return <Navigate to="/cabinet" replace />
  return <>{children}</>
}

/** Redirect authenticated users away from auth pages */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const me = useAuthStore((s) => s.me)
  if (me) {
    return <Navigate to={me.role === 'admin' ? '/admin' : '/cabinet'} replace />
  }
  return <>{children}</>
}
