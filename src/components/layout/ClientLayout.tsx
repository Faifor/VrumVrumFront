import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { toggleTheme, isDarkMode } from '@/utils/theme'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { to: '/cabinet',          label: 'Главная', icon: HomeIcon,    end: true  },
  { to: '/cabinet/profile',  label: 'Анкета',  icon: ProfileIcon, end: false },
  { to: '/cabinet/payments', label: 'Платежи', icon: PayIcon,     end: false },
]

/** Extract first name: "Фамилия Имя Отчество" → "Имя" */
function getFirstName(full_name: string | null, email: string): string {
  if (!full_name) return email.split('@')[0]
  const parts = full_name.trim().split(/\s+/)
  return parts[1] ?? parts[0]
}

export default function ClientLayout() {
  const { me, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dark, setDark] = useState(isDarkMode)

  const displayName = getFirstName(me?.full_name ?? null, me?.email ?? '')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass shadow-sm">
        <div className="px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <span className="text-xl font-bold text-gradient flex-1">Vrum</span>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* User name — truncated gracefully */}
            <span className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400">
              {displayName}
            </span>

            <ThemeButton dark={dark} onToggle={() => setDark(toggleTheme())} />

            <button
              onClick={() => { logout(); navigate('/auth/login') }}
              className={clsx(
                'ml-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
                'text-slate-500 dark:text-slate-400',
                'hover:text-red-500 dark:hover:text-red-400',
                'hover:bg-red-50 dark:hover:bg-red-500/10',
              )}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-56 w-full px-4 py-6 pb-28 md:pb-8 max-w-screen-lg md:max-w-[calc(100%-14rem)] mx-auto">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* ── Bottom nav (mobile) ───────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass border-t border-slate-200/60 dark:border-slate-700/40">
        <div className="flex safe-area-inset-bottom">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => clsx(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={clsx(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-brand-100 dark:bg-brand-500/20 shadow-glow-sm'
                      : 'group-hover:bg-slate-100',
                  )}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/40 px-3 py-5 gap-1">
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
                ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 shadow-glow-sm'
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
    </div>
  )
}

/* ── Theme toggle ─────────────────────────────────────────────────── */
function ThemeButton({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
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
  )
}

/* ── Icons ─────────────────────────────────────────────────────────── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function PayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
