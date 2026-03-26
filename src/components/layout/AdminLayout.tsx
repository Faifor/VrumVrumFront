import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import clsx from 'clsx'
import { useState } from 'react'

const navItems = [
  { to: '/admin', label: 'Главная', end: true },
  { to: '/admin/users', label: 'Пользователи', end: false },
  { to: '/admin/inventory', label: 'Инвентарь', end: false },
]

export default function AdminLayout() {
  const { me, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1 rounded text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-brand-600 flex-1">Vrum Admin</span>
          <span className="hidden sm:block text-sm text-gray-500">{me?.email}</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Выйти
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-white px-3 py-4 gap-1 sticky top-14 self-start h-[calc(100vh-3.5rem)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>

        {/* Mobile drawer */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />
            <div className="fixed left-0 top-14 bottom-0 z-50 w-64 bg-white border-r px-3 py-4 flex flex-col gap-1 md:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-6 max-w-screen-xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
