import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '@/stores/admin.store'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatusBadge from '@/components/ui/StatusBadge'

export default function AdminDashboard() {
  const { users, bikes, fetchUsers, fetchBikes, isLoading } = useAdminStore()

  useEffect(() => {
    fetchUsers('all')
    fetchBikes()
  }, [fetchUsers, fetchBikes])

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const freeCount = bikes.filter((b) => b.status === 'free').length
  const rentedCount = bikes.filter((b) => b.status === 'rented').length

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>

      {isLoading && <LoadingSpinner />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Всего пользователей" value={users.length} />
        <StatCard label="На проверке" value={pendingUsers.length} accent />
        <StatCard label="Велосипеды свободны" value={freeCount} />
        <StatCard label="В аренде" value={rentedCount} />
      </div>

      {/* Pending users */}
      {pendingUsers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Ожидают проверки</h2>
            <Link to="/admin/users?status=pending" className="text-sm text-brand-600 hover:underline">
              Все →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {pendingUsers.slice(0, 5).map((u) => (
              <Link
                key={u.id}
                to={`/admin/users/${u.id}`}
                className="flex items-center justify-between rounded-xl bg-white border shadow-sm px-4 py-3 hover:border-brand-400 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <StatusBadge status={u.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/admin/users" className="rounded-2xl bg-white border shadow-sm p-4 hover:border-brand-400 transition-colors">
          <p className="text-2xl mb-1">👥</p>
          <p className="text-sm font-medium text-gray-900">Пользователи</p>
        </Link>
        <Link to="/admin/inventory" className="rounded-2xl bg-white border shadow-sm p-4 hover:border-brand-400 transition-colors">
          <p className="text-2xl mb-1">🛵</p>
          <p className="text-sm font-medium text-gray-900">Инвентарь</p>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border shadow-sm p-4 ${accent ? 'bg-brand-50 border-brand-200' : 'bg-white'}`}>
      <p className={`text-2xl font-bold ${accent ? 'text-brand-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
