import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdminStore } from '@/stores/admin.store'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { DocumentStatus } from '@/types'
import clsx from 'clsx'

const TABS: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Черновик', value: 'draft' },
  { label: 'На проверке', value: 'pending' },
  { label: 'Одобрены', value: 'approved' },
  { label: 'Отклонены', value: 'rejected' },
]

export default function AdminUsers() {
  const [params, setParams] = useSearchParams()
  const statusParam = (params.get('status') ?? 'all') as DocumentStatus | 'all'
  const { users, isLoading, fetchUsers } = useAdminStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers(statusParam)
  }, [statusParam, fetchUsers])

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Пользователи</h1>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setParams({ status: tab.value })}
            className={clsx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              statusParam === tab.value
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Поиск по имени, email, телефону..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {isLoading && <LoadingSpinner />}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Автоплатёж</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.full_name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.phone ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3">
                  <span className={u.autopay_enabled ? 'text-green-600' : 'text-gray-400'}>
                    {u.autopay_enabled ? 'Вкл' : 'Выкл'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/admin/users/${u.id}`} className="text-brand-600 hover:underline text-xs">
                    Открыть →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Пользователи не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((u) => (
          <Link
            key={u.id}
            to={`/admin/users/${u.id}`}
            className="rounded-2xl bg-white border shadow-sm p-4 flex justify-between items-start hover:border-brand-400 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{u.full_name ?? u.email}</p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
              {u.phone && <p className="text-xs text-gray-500 mt-0.5">{u.phone}</p>}
            </div>
            <StatusBadge status={u.status} className="shrink-0" />
          </Link>
        ))}
        {filtered.length === 0 && !isLoading && (
          <p className="text-center py-8 text-gray-400">Пользователи не найдены</p>
        )}
      </div>
    </div>
  )
}
