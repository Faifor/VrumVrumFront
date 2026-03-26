import clsx from 'clsx'
import type { DocumentStatus, ContractPaymentStatus, AssetStatus } from '@/types'

type AnyStatus = DocumentStatus | ContractPaymentStatus | AssetStatus | string

const statusConfig: Record<string, { label: string; className: string }> = {
  // Document statuses
  draft: { label: 'Черновик', className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'На проверке', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Одобрено', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Отклонено', className: 'bg-red-100 text-red-800' },

  // Payment statuses
  processing: { label: 'Обрабатывается', className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Оплачено', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Не оплачено', className: 'bg-red-100 text-red-800' },
  succeeded: { label: 'Успешно', className: 'bg-green-100 text-green-800' },
  canceled: { label: 'Отменено', className: 'bg-gray-100 text-gray-600' },

  // Asset statuses
  free: { label: 'Свободен', className: 'bg-green-100 text-green-800' },
  rented: { label: 'В аренде', className: 'bg-blue-100 text-blue-800' },
  repair: { label: 'На ремонте', className: 'bg-orange-100 text-orange-800' },
  decommissioned: { label: 'Списан', className: 'bg-gray-100 text-gray-500' },
}

interface Props {
  status: AnyStatus
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}
