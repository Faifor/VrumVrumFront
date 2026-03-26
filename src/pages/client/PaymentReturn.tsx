import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { usePaymentStore } from '@/stores/payment.store'
import { paymentApi } from '@/api/payment.api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

export default function PaymentReturn() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')
  const { pendingPayment } = usePaymentStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading')

  useEffect(() => {
    const id = orderId ? Number(orderId) : pendingPayment?.order_id
    if (!id) { setStatus('pending'); return }

    ;(async () => {
      try {
        const { data } = await paymentApi.getOrder(id)
        if (data.status === 'succeeded') setStatus('success')
        else if (data.status === 'canceled') setStatus('failed')
        else setStatus('pending')
      } catch {
        setStatus('pending')
      }
    })()
  }, [orderId, pendingPayment])

  if (status === 'loading') return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      {status === 'success' && (
        <>
          <div className="text-6xl">✅</div>
          <h1 className="text-xl font-bold text-gray-900">Оплата прошла успешно!</h1>
          <p className="text-gray-500 text-sm text-center">Платёж зачислен. График обновится автоматически.</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="text-6xl">❌</div>
          <h1 className="text-xl font-bold text-gray-900">Платёж отменён</h1>
          <p className="text-gray-500 text-sm text-center">Попробуйте оплатить ещё раз в разделе платежей.</p>
        </>
      )}
      {status === 'pending' && (
        <>
          <div className="text-6xl">⏳</div>
          <h1 className="text-xl font-bold text-gray-900">Платёж обрабатывается</h1>
          <p className="text-gray-500 text-sm text-center">Статус обновится в ближайшее время.</p>
        </>
      )}
      <Link to="/cabinet/payments">
        <Button variant="secondary">← К платежам</Button>
      </Link>
    </div>
  )
}
