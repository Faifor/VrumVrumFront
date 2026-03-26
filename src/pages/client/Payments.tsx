import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { usePaymentStore } from '@/stores/payment.store'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from '@/components/ui/Toast'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { ContractPaymentRead } from '@/types'

export default function PaymentsPage() {
  const { me, refreshMe } = useAuthStore()
  const { schedule, isLoading, fetchSchedule, payScheduleItem, enableAutopay, disableAutopay } = usePaymentStore()
  const [payingId, setPayingId] = useState<number | null>(null)
  const [togglingAutopay, setTogglingAutopay] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const handlePay = async (item: ContractPaymentRead) => {
    setPayingId(item.id)
    try {
      const returnUrl = `${window.location.origin}/cabinet/payment/return`
      const result = await payScheduleItem(item.id, item.amount, returnUrl)
      window.location.href = result.confirmation_url
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setPayingId(null)
    }
  }

  const handleToggleAutopay = async () => {
    setTogglingAutopay(true)
    try {
      if (me?.autopay_enabled) {
        await disableAutopay()
        toast.success('Автоплатёж отключён')
      } else {
        await enableAutopay()
        toast.success('Автоплатёж включён')
      }
      await refreshMe()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setTogglingAutopay(false)
    }
  }

  const fmtDate = (d: string) => format(new Date(d), 'd MMM yyyy', { locale: ru })

  const typeLabel: Record<string, string> = {
    rent: 'Аренда',
    damage: 'Ущерб',
    recalculation: 'Перерасчёт',
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  const pendingItems = schedule.filter((s) => s.status === 'pending' || s.status === 'failed')
  const paidItems = schedule.filter((s) => s.status === 'paid')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Платежи</h1>
      </div>

      {/* Autopay toggle */}
      <div className="rounded-2xl bg-white border shadow-sm p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Автоплатёж</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {me?.autopay_enabled
              ? 'Включён — платежи будут списываться автоматически'
              : 'Выключен — нужно оплачивать вручную'}
          </p>
        </div>
        <Button
          variant={me?.autopay_enabled ? 'secondary' : 'primary'}
          size="sm"
          isLoading={togglingAutopay}
          onClick={handleToggleAutopay}
        >
          {me?.autopay_enabled ? 'Отключить' : 'Включить'}
        </Button>
      </div>

      {/* Pending payments */}
      {pendingItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            К оплате
          </h2>
          <div className="flex flex-col gap-3">
            {pendingItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white border shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.amount.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-xs text-gray-400">#{item.payment_number}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {typeLabel[item.payment_type] ?? item.payment_type} · до {fmtDate(item.due_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={item.status} />
                    <Button
                      size="sm"
                      isLoading={payingId === item.id}
                      onClick={() => handlePay(item)}
                    >
                      Оплатить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paid payments */}
      {paidItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            История оплат
          </h2>
          <div className="flex flex-col gap-2">
            {paidItems.map((item) => (
              <div key={item.id} className="rounded-xl bg-white border p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  <p className="text-xs text-gray-400">
                    {typeLabel[item.payment_type]} · оплачено {item.paid_at ? fmtDate(item.paid_at) : ''}
                  </p>
                </div>
                <StatusBadge status="paid" />
              </div>
            ))}
          </div>
        </section>
      )}

      {schedule.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📅</p>
          <p>Платёжный график пока не сформирован</p>
        </div>
      )}
    </div>
  )
}
