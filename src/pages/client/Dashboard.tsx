import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useDocumentStore } from '@/stores/document.store'
import Button from '@/components/ui/Button'
import clsx from 'clsx'
import type { UserContractItem } from '@/types'

/** "Фамилия Имя Отчество" → "Имя" */
function getFirstName(full_name: string | null): string {
  if (!full_name) return 'пользователь'
  const parts = full_name.trim().split(/\s+/)
  return parts[1] ?? parts[0]
}

function getInitials(full_name: string | null, email: string): string {
  if (!full_name) return email[0]?.toUpperCase() ?? '?'
  const parts = full_name.trim().split(/\s+/)
  return ((parts[1]?.[0] ?? '') + (parts[0]?.[0] ?? '')).toUpperCase() || email[0]?.toUpperCase() || '?'
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return { text: 'Доброй ночи',  emoji: '🌙' }
  if (h < 12) return { text: 'Доброе утро',  emoji: '☀️' }
  if (h < 18) return { text: 'Добрый день',  emoji: '👋' }
  return         { text: 'Добрый вечер', emoji: '🌆' }
}

const statusConfig: Record<string, {
  title: string
  body: string
  gradient: string
  darkGradient: string
  bg: string
  border: string
  badge: string
  step: number
}> = {
  draft: {
    title: 'Заполните анкету',
    body: 'Для начала аренды нам нужны ваши данные. Это займёт пару минут.',
    gradient: 'from-slate-500 to-slate-600',
    darkGradient: 'dark:from-slate-600 dark:to-slate-700',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/50',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    step: 1,
  },
  pending: {
    title: 'Анкета проверяется',
    body: 'Мы получили вашу анкету и проверяем данные. Обычно это занимает до 1 рабочего дня.',
    gradient: 'from-amber-400 to-orange-500',
    darkGradient: 'dark:from-amber-500 dark:to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    step: 2,
  },
  approved: {
    title: 'Аккаунт подтверждён',
    body: 'Ваша анкета одобрена. Менеджер свяжется с вами для оформления договора аренды.',
    gradient: 'from-emerald-400 to-teal-500',
    darkGradient: 'dark:from-emerald-500 dark:to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    step: 3,
  },
  rejected: {
    title: 'Анкета отклонена',
    body: 'Некоторые данные не прошли проверку. Исправьте ошибки и отправьте анкету заново.',
    gradient: 'from-red-400 to-rose-500',
    darkGradient: 'dark:from-red-500 dark:to-rose-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    step: 0,
  },
}

export default function ClientDashboard() {
  const { me } = useAuthStore()
  const { contracts, fetchActiveContracts } = useDocumentStore()

  useEffect(() => { fetchActiveContracts() }, [fetchActiveContracts])

  const status      = me?.status ?? 'draft'
  const cfg         = statusConfig[status]
  const firstName   = getFirstName(me?.full_name ?? null)
  const initials    = getInitials(me?.full_name ?? null, me?.email ?? '')
  const greeting    = getGreeting()
  const hasContract = contracts.some(c => c.active)

  return (
    <div className="flex flex-col gap-5 pb-2">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden animate-fade-up">
        {/* Gradient background */}
        <div className={clsx(
          'absolute inset-0 bg-gradient-to-br',
          'from-brand-500 via-brand-600 to-indigo-700',
          'dark:from-brand-700 dark:via-brand-800 dark:to-indigo-900',
        )} />

        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-12 -left-6 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl" />
        <div className="absolute top-4 right-1/3 h-20 w-20 rounded-full bg-white/5" />

        {/* Content */}
        <div className="relative px-6 pt-7 pb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">
              {greeting.emoji} {greeting.text}
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight">
              {firstName}!
            </h1>
            <p className="text-brand-200/80 text-sm mt-1.5 truncate max-w-[220px]">
              {me?.email}
            </p>
          </div>

          {/* Avatar */}
          <div className={clsx(
            'shrink-0 w-14 h-14 rounded-2xl',
            'bg-white/20 backdrop-blur-sm border border-white/30',
            'flex items-center justify-center',
            'text-white font-bold text-xl',
            'shadow-lg',
          )}>
            {initials}
          </div>
        </div>

        {/* Progress steps */}
        <div className="relative px-6 pb-6">
          <div className="flex items-center gap-0">
            {[
              { n: 1, label: 'Анкета' },
              { n: 2, label: 'Проверка' },
              { n: 3, label: 'Договор' },
            ].map((s, i) => {
              const done    = status !== 'rejected' && (cfg.step > s.n || (s.n === 3 && hasContract))
              const active  = status !== 'rejected' && cfg.step === s.n && !(s.n === 3 && hasContract)
              const isFail  = status === 'rejected' && s.n === 1
              return (
                <div key={s.n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      done   ? 'bg-white text-brand-600'           : '',
                      active ? 'bg-white/30 text-white border-2 border-white' : '',
                      isFail ? 'bg-red-400 text-white'             : '',
                      !done && !active && !isFail ? 'bg-white/15 text-white/50' : '',
                    )}>
                      {done ? '✓' : isFail ? '✗' : s.n}
                    </div>
                    <span className={clsx(
                      'text-[10px] font-medium whitespace-nowrap',
                      done || active ? 'text-white' : 'text-white/40',
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={clsx(
                      'flex-1 h-0.5 mb-5 mx-1',
                      done ? 'bg-white/70' : 'bg-white/20',
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STATUS CARD
      ══════════════════════════════════════════════════════ */}
      <div className={clsx(
        'animate-fade-up delay-75',
        'rounded-2xl border p-5',
        cfg.bg, cfg.border,
      )}>
        <div className="flex items-start gap-4">
          {/* Gradient icon */}
          <div className={clsx(
            'shrink-0 w-11 h-11 rounded-2xl',
            'bg-gradient-to-br shadow-md',
            cfg.gradient, cfg.darkGradient,
            'flex items-center justify-center',
          )}>
            <StatusIcon status={status} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{cfg.title}</p>
              <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', cfg.badge)}>
                {status === 'draft' ? 'Новый' : status === 'pending' ? 'На проверке' : status === 'approved' ? 'Активен' : 'Отклонено'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{cfg.body}</p>

            {status === 'rejected' && me?.rejection_reason && (
              <div className="mt-3 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 px-3 py-2.5">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5">Причина:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{me.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {(status === 'draft' || status === 'rejected') && (
          <Link to="/cabinet/profile" className="mt-4 block">
            <Button className="w-full sm:w-auto" size="lg">
              {status === 'rejected' ? '✏️  Исправить анкету' : '📝  Заполнить анкету'}
            </Button>
          </Link>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          ACTIVE CONTRACTS
      ══════════════════════════════════════════════════════ */}
      {contracts.length > 0 && (
        <div className="animate-fade-up delay-150">
          <div className="flex items-center justify-between mb-3">
            <h2 className="label-muted">Мои договоры</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">{contracts.length} шт.</span>
          </div>
          <div className="flex flex-col gap-3">
            {contracts.map((c, i) => (
              <ContractCard key={c.id} contract={c} delay={i * 50} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          QUICK ACTIONS
      ══════════════════════════════════════════════════════ */}
      <div className="animate-fade-up delay-225 grid grid-cols-2 gap-3">
        <ActionTile
          to="/cabinet/payments"
          gradient="from-violet-500 to-purple-600"
          icon={<CreditCardIcon />}
          label="Платежи"
          sub="График оплат"
        />
        <ActionTile
          to="/cabinet/profile"
          gradient="from-brand-500 to-indigo-600"
          icon={<ProfileIcon />}
          label="Анкета"
          sub="Личные данные"
        />
      </div>
    </div>
  )
}

/* ── Contract card ────────────────────────────────────────────────────── */
function ContractCard({ contract: c, delay }: { contract: UserContractItem; delay: number }) {
  return (
    <Link
      to={`/cabinet/document/${c.id}`}
      style={{ animationDelay: `${200 + delay}ms` }}
      className={clsx(
        'group animate-fade-up block rounded-2xl',
        'bg-white dark:bg-slate-800/60',
        'border border-slate-200 dark:border-slate-700/50',
        'shadow-sm hover:shadow-md dark:hover:shadow-black/30',
        'hover:border-brand-400/60 dark:hover:border-brand-500/40',
        'hover:-translate-y-0.5 transition-all duration-200',
        'overflow-hidden',
      )}
    >
      {/* Accent left border */}
      <div className={clsx(
        'flex',
      )}>
        <div className={clsx(
          'w-1 shrink-0',
          c.active ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600',
        )} />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Contract number */}
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {c.contract_number ?? `Договор #${c.id}`}
                </p>
                {c.active && (
                  <span className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Активен
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {c.bike_serial && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    🚲 {c.bike_serial}
                  </span>
                )}
                {c.filled_date && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {c.filled_date} → {c.end_date ?? '∞'}
                  </span>
                )}
                {c.amount && (
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    {Number(c.amount).toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className={clsx(
              'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
              'bg-slate-100 dark:bg-slate-700/60',
              'group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20',
              'group-hover:text-brand-600 dark:group-hover:text-brand-400',
              'text-slate-400 transition-all duration-200',
            )}>
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Signed status bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {c.weeks_count ? `${c.weeks_count} недель` : 'Срок не указан'}
            </span>
            <span className={clsx(
              'text-[11px] font-semibold px-2 py-0.5 rounded-full',
              c.signed
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
            )}>
              {c.signed ? '✓ Подписан' : '⏳ Ожидает подписи'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Action tile ──────────────────────────────────────────────────────── */
function ActionTile({ to, gradient, icon, label, sub }: {
  to: string; gradient: string; icon: React.ReactNode; label: string; sub: string
}) {
  return (
    <Link
      to={to}
      className={clsx(
        'group relative rounded-2xl overflow-hidden',
        'bg-white dark:bg-slate-800/60',
        'border border-slate-200 dark:border-slate-700/50',
        'shadow-sm hover:shadow-lg dark:hover:shadow-black/30',
        'hover:-translate-y-1 transition-all duration-200',
        'p-4 flex flex-col gap-3',
      )}
    >
      {/* Background glow on hover */}
      <div className={clsx(
        'absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10',
        'bg-gradient-to-br transition-opacity duration-200',
        gradient,
      )} />

      {/* Icon box */}
      <div className={clsx(
        'relative w-11 h-11 rounded-xl flex items-center justify-center',
        'bg-gradient-to-br shadow-md',
        gradient,
        'text-white',
        'group-hover:scale-110 transition-transform duration-200',
      )}>
        {icon}
      </div>

      {/* Text */}
      <div className="relative">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
      </div>

      {/* Arrow */}
      <div className="absolute bottom-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-400 dark:group-hover:text-brand-500 transition-colors duration-200">
        <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  )
}

/* ── Icons ────────────────────────────────────────────────────────────── */
function StatusIcon({ status }: { status: string }) {
  const cls = 'h-5 w-5 text-white'
  if (status === 'approved') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
  if (status === 'rejected') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
  if (status === 'pending') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
