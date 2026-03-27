import clsx from 'clsx'
import type { DocumentStatus, ContractPaymentStatus, AssetStatus } from '@/types'

type AnyStatus = DocumentStatus | ContractPaymentStatus | AssetStatus | string

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  draft:          { label: 'Черновик',       dot: 'bg-slate-400',                         className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  pending:        { label: 'На проверке',    dot: 'bg-amber-400 animate-pulse',            className: 'bg-amber-50  text-amber-700  dark:bg-amber-950/50  dark:text-amber-400' },
  approved:       { label: 'Одобрено',       dot: 'bg-emerald-400',                        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  rejected:       { label: 'Отклонено',      dot: 'bg-red-400',                            className: 'bg-red-50  text-red-700  dark:bg-red-950/50  dark:text-red-400' },
  processing:     { label: 'Обрабатывается', dot: 'bg-blue-400 animate-pulse',             className: 'bg-blue-50  text-blue-700  dark:bg-blue-950/50  dark:text-blue-400' },
  paid:           { label: 'Оплачено',       dot: 'bg-emerald-400',                        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  failed:         { label: 'Не оплачено',    dot: 'bg-red-400',                            className: 'bg-red-50  text-red-700  dark:bg-red-950/50  dark:text-red-400' },
  succeeded:      { label: 'Успешно',        dot: 'bg-emerald-400',                        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  canceled:       { label: 'Отменено',       dot: 'bg-slate-400',                          className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
  free:           { label: 'Свободен',       dot: 'bg-emerald-400',                        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  rented:         { label: 'В аренде',       dot: 'bg-blue-400',                           className: 'bg-blue-50  text-blue-700  dark:bg-blue-950/50  dark:text-blue-400' },
  repair:         { label: 'На ремонте',     dot: 'bg-amber-400',                          className: 'bg-amber-50  text-amber-700  dark:bg-amber-950/50  dark:text-amber-400' },
  decommissioned: { label: 'Списан',         dot: 'bg-slate-300',                          className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-600' },
}

interface Props {
  status: AnyStatus
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  const cfg = statusConfig[status] ?? {
    label: status,
    dot: 'bg-slate-400',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
