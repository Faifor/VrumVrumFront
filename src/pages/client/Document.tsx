import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDocumentStore } from '@/stores/document.store'
import { documentApi } from '@/api/document.api'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from '@/components/ui/Toast'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const { document, fetchDocument, isLoading } = useDocumentStore()
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (id) fetchDocument(Number(id))
  }, [id, fetchDocument])

  const handleDownload = async () => {
    if (!id) return
    setDownloading(true)
    try {
      await documentApi.downloadContractDocx(Number(id))
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!document) return <p className="text-gray-500">Договор не найден.</p>

  const fmtDate = (d: string | null) =>
    d ? format(new Date(d), 'd MMMM yyyy', { locale: ru }) : '—'

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Договор {document.contract_number ?? `#${document.id}`}
        </h1>
        <StatusBadge status={document.signed ? 'approved' : 'pending'} />
      </div>

      {/* Contract details */}
      <div className="rounded-2xl bg-white border shadow-sm p-5 flex flex-col gap-3">
        <Row label="Велосипед" value={document.bike_serial ?? '—'} />
        <Row label="АКБ 1" value={document.akb1_serial ?? '—'} />
        <Row label="АКБ 2" value={document.akb2_serial ?? '—'} />
        <Row label="Дата начала" value={fmtDate(document.filled_date)} />
        <Row label="Дата окончания" value={fmtDate(document.end_date)} />
        <Row label="Недель" value={document.weeks_count?.toString() ?? '—'} />
        <Row label="Сумма" value={document.amount ? `${document.amount} ₽` : '—'} />
        {document.amount_text && (
          <Row label="Сумма прописью" value={document.amount_text} />
        )}
      </div>

      {document.contract_text && (
        <div className="rounded-2xl bg-white border shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Текст договора</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{document.contract_text}</p>
        </div>
      )}

      {/* Download button */}
      {document.signed && (
        <div className="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-white/90 backdrop-blur border-t">
          <Button onClick={handleDownload} isLoading={downloading} className="w-full sm:w-auto">
            Скачать договор (.docx)
          </Button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}
