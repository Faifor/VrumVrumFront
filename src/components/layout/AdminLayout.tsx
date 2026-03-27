import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { toggleTheme, isDarkMode } from '@/utils/theme'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { to: '/admin',           label: 'Дашборд',       icon: GridIcon,  end: true  },
  { to: '/admin/users',     label: 'Пользователи',  icon: UsersIcon, end: false },
  { to: '/admin/inventory', label: 'Инвентарь',     icon: BoxIcon,   end: false },
]

export default function AdminLayout() {
  const { me, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(isDarkMode)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass shadow-sm">
        <div className="px-4 h-14 flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={clsx(
              'md:hidden p-2 rounded-xl transition-all duration-150',
              'text-slate-500 dark:text-slate-400',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'active:scale-90',
              menuOpen && 'bg-slate-100 dark:bg-slate-800',
            )}
          >
            {menuOpen
              ? <XIcon className="h-5 w-5" />
              : <MenuIcon className="h-5 w-5" />
            }
          </button>

          <span className="text-xl font-bold text-gradient flex-1">Vrum Admin</span>

          <span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400">
            {me?.email}
          </span>

          {/* Theme toggle */}
          <button
            onClick={() => setDark(toggleTheme())}
            title={dark ? 'Светлая тема' : 'Тёмная тема'}
            className={clsx(
              'p-2 rounded-xl transition-all duration-150',
              'text-slate-500 dark:text-slate-400',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'active:scale-90',
            )}
          >
            {dark
              ? <SunIcon className="h-4 w-4 text-amber-400" />
              : <MoonIcon className="h-4 w-4" />
            }
          </button>

          <button
            onClick={() => { logout(); navigate('/auth/login') }}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
              'text-slate-500 dark:text-slate-400',
              'hover:text-red-500 dark:hover:text-red-400',
              'hover:bg-red-50 dark:hover:bg-red-500/10',
            )}
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* ── Sidebar desktop ───────────────────────────────────── */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/40 px-3 py-5 gap-1 sticky top-14 self-start h-[calc(100vh-3.5rem)]">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={{ animationDelay: `${i * 60}ms` }}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-150 animate-fade-in',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500',
                  )} />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </aside>

        {/* ── Mobile drawer ─────────────────────────────────────── */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
              onClick={() => setMenuOpen(false)}
            />
            <div className="fixed left-0 top-14 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-3 py-5 flex flex-col gap-1 md:hidden animate-slide-left">
              <p className="label-muted px-3 mb-2">Навигация</p>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                    'transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={clsx('h-5 w-5', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </>
        )}

        {/* ── Main ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-4 py-6">
          <div className="max-w-screen-xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────── */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
