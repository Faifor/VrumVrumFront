import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import clsx from 'clsx'

const navItems = [
  { to: '/cabinet', label: 'Главная', icon: HomeIcon, end: true },
  { to: '/cabinet/profile', label: 'Анкета', icon: UserIcon, end: false },
  { to: '/cabinet/payments', label: 'Платежи', icon: PayIcon, end: false },
]

export default function ClientLayout() {
  const { me, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-screen-lg px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-600">Vrum</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[180px]">
              {me?.full_name ?? me?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-screen-lg px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t md:hidden">
        <div className="flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                  isActive ? 'text-brand-600' : 'text-gray-400',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sidebar nav (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 flex-col border-r bg-white px-3 py-4 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </aside>
    </div>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function PayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}
