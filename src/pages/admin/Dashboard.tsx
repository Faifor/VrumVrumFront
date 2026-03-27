import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '@/stores/admin.store'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatusBadge from '@/components/ui/StatusBadge'
import clsx from 'clsx'

export default function AdminDashboard() {
  const { users, bikes, fetchUsers, fetchBikes, isLoading } = useAdminStore()

  useEffect(() => {
    fetchUsers('all')
    fetchBikes()
  }, [fetchUsers, fetchBikes])

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const freeCount    = bikes.filter((b) => b.status === 'free').length
  const rentedCount  = bikes.filter((b) => b.status === 'rented').length

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Дашборд</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Обзор системы</p>
      </div>

      {/* ── Stats grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 animate-fade-up delay-75">
        <StatCard
          label="Пользователей"
          value={users.length}
          icon="👥"
          gradient="from-brand-500 to-indigo-600"
        />
        <StatCard
          label="На проверке"
          value={pendingUsers.length}
          icon="⏳"
          gradient="from-amber-400 to-orange-500"
          pulse={pendingUsers.length > 0}
        />
        <StatCard
          label="Свободных"
          value={freeCount}
          icon="🚲"
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          label="В аренде"
          value={rentedCount}
          icon="🔑"
          gradient="from-violet-500 to-purple-600"
        />
      </div>

      {/* ── Pending users ────────────────────────────────────── */}
      {pendingUsers.length > 0 && (
        <div className="animate-fade-up delay-150">
          <div className="flex items-center justify-between mb-3">
            <h2 className="label-muted">Ожидают проверки</h2>
            <Link
              to="/admin/users?status=pending"
              className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              Все →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {pendingUsers.slice(0, 5).map((u, i) => (
              <Link
                key={u.id}
                to={`/admin/users/${u.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className="card-interactive flex items-center justify-between px-4 py-3 animate-fade-up"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {u.full_name ?? u.email}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                </div>
                <StatusBadge status={u.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick nav ────────────────────────────────────────── */}
      <div className="animate-fade-up delay-225 grid grid-cols-2 gap-3">
        <NavCard to="/admin/users"     icon="👥" label="Пользователи" sub="Управление базой" />
        <NavCard to="/admin/inventory" icon="📦" label="Инвентарь"    sub="Велосипеды и АКБ" />
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, gradient, pulse,
}: {
  label: string; value: number; icon: string; gradient: string; pulse?: boolean
}) {
  return (
    <div className="card p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Background gradient blob */}
      <div className={clsx(
        'absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 dark:opacity-15 blur-xl',
        'bg-gradient-to-br', gradient,
      )} />

      <div className={clsx(
        'w-9 h-9 rounded-xl flex items-center justify-center text-base',
        'bg-gradient-to-br', gradient,
        'shadow-md',
        pulse && 'animate-pulse-glow',
      )}>
        {icon}
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function NavCard({ to, icon, label, sub }: { to: string; icon: string; label: string; sub: string }) {
  return (
    <Link to={to} className="card-interactive p-4 flex flex-col gap-2">
      <span className="text-2xl leading-none">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
      </div>
    </Link>
  )
}
