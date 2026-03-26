import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useDocumentStore } from '@/stores/document.store'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

const statusMessages: Record<string, { title: string; body: string }> = {
  draft: {
    title: 'Заполните анкету',
    body: 'Для начала аренды нам нужны ваши персональные данные. Это займёт пару минут.',
  },
  pending: {
    title: 'Анкета на проверке',
    body: 'Ваша анкета отправлена на модерацию. Обычно это занимает до 1 рабочего дня.',
  },
  approved: {
    title: 'Анкета одобрена',
    body: 'Ваш аккаунт подтверждён. Ожидайте оформления договора.',
  },
  rejected: {
    title: 'Анкета отклонена',
    body: 'Ваша анкета была отклонена. Исправьте данные и отправьте повторно.',
  },
}

export default function ClientDashboard() {
  const { me } = useAuthStore()
  const { contracts, fetchActiveContracts } = useDocumentStore()

  useEffect(() => {
    fetchActiveContracts()
  }, [fetchActiveContracts])

  const statusInfo = statusMessages[me?.status ?? 'draft']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Привет, {me?.full_name?.split(' ')[0] ?? 'пользователь'}!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{me?.email}</p>
      </div>

      {/* Status card */}
      <div className="rounded-2xl bg-white border shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Статус анкеты</p>
            <StatusBadge status={me?.status ?? 'draft'} className="mb-2" />
            <h2 className="text-base font-semibold text-gray-900">{statusInfo.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{statusInfo.body}</p>
            {me?.status === 'rejected' && me.rejection_reason && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <strong>Причина: </strong>{me.rejection_reason}
              </div>
            )}
          </div>
        </div>

        {(me?.status === 'draft' || me?.status === 'rejected') && (
          <Link to="/cabinet/profile">
            <Button className="mt-4 w-full sm:w-auto">
              {me.status === 'rejected' ? 'Заполнить заново' : 'Заполнить анкету'}
            </Button>
          </Link>
        )}
      </div>

      {/* Active contracts */}
      {contracts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Мои договоры</h2>
          <div className="flex flex-col gap-3">
            {contracts.map((c) => (
              <Link
                key={c.id}
                to={`/cabinet/document/${c.id}`}
                className="block rounded-2xl bg-white border shadow-sm p-4 hover:border-brand-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Договор {c.contract_number ?? `#${c.id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.filled_date} → {c.end_date ?? '—'}
                      {c.bike_serial && ` · Велосипед ${c.bike_serial}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={c.signed ? 'approved' : 'pending'} />
                    {c.active && (
                      <span className="text-xs text-green-600 font-medium">Активен</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/cabinet/payments"
          className="rounded-2xl bg-white border shadow-sm p-4 flex flex-col gap-1 hover:border-brand-400 transition-colors"
        >
          <span className="text-2xl">💳</span>
          <span className="text-sm font-medium text-gray-900">Платежи</span>
          <span className="text-xs text-gray-400">График и история</span>
        </Link>
        <Link
          to="/cabinet/profile"
          className="rounded-2xl bg-white border shadow-sm p-4 flex flex-col gap-1 hover:border-brand-400 transition-colors"
        >
          <span className="text-2xl">📋</span>
          <span className="text-sm font-medium text-gray-900">Анкета</span>
          <span className="text-xs text-gray-400">Личные данные</span>
        </Link>
      </div>
    </div>
  )
}
