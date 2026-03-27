import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdminStore } from '@/stores/admin.store'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { DocumentStatus } from '@/types'
import clsx from 'clsx'

const TABS: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'Все',         value: 'all'      },
  { label: 'Черновик',    value: 'draft'    },
  { label: 'На проверке', value: 'pending'  },
  { label: 'Одобрены',    value: 'approved' },
  { label: 'Отклонены',   value: 'rejected' },
]

export default function AdminUsers() {
  const [params, setParams] = useSearchParams()
  const statusParam = (params.get('status') ?? 'all') as DocumentStatus | 'all'
  const { users, isLoading, fetchUsers } = useAdminStore()
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers(statusParam) }, [statusParam, fetchUsers])

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
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Пользователи</h1>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setParams({ status: tab.value })}
            className={clsx(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
              statusParam === tab.value
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
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
        className={clsx(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150',
          'bg-white dark:bg-slate-800/80',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-600',
          'border-slate-200 dark:border-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          'dark:focus:ring-brand-400/40 dark:focus:border-brand-400',
        )}
      />

      {isLoading && <LoadingSpinner />}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/60 text-left">
              <th className="px-4 py-3 label-muted">Пользователь</th>
              <th className="px-4 py-3 label-muted">Телефон</th>
              <th className="px-4 py-3 label-muted">Статус</th>
              <th className="px-4 py-3 label-muted">Автоплатёж</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-100 dark:border-slate-700/40 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{u.full_name ?? '—'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.phone ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3">
                  <span className={u.autopay_enabled ? 'text-emerald-600 dark:text-emerald-400 text-sm font-medium' : 'text-slate-400 dark:text-slate-600 text-sm'}>
                    {u.autopay_enabled ? 'Вкл' : 'Выкл'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/users/${u.id}`}
                    className="text-brand-600 dark:text-brand-400 hover:underline text-xs font-medium"
                  >
                    Открыть →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-600">
                  Пользователи не найдены
                </td>
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
            className="card-interactive block p-4"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{u.full_name ?? u.email}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                {u.phone && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.phone}</p>}
              </div>
              <StatusBadge status={u.status} className="shrink-0" />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && !isLoading && (
          <p className="text-center py-10 text-slate-400 dark:text-slate-600">Пользователи не найдены</p>
        )}
      </div>
    </div>
  )
}
