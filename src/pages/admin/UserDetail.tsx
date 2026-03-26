import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminStore } from '@/stores/admin.store'
import { adminContractApi, adminReturnActApi } from '@/api/admin.api'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from '@/components/ui/Toast'
import Input from '@/components/ui/Input'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { UserDocumentRead, ReturnActCreateRequest } from '@/types'

const rejectSchema = z.object({ reason: z.string().min(5, 'Укажите причину') })
const contractSchema = z.object({
  bike_serial: z.string().optional(),
  akb1_serial: z.string().optional(),
  akb2_serial: z.string().optional(),
  weeks_count: z.coerce.number().int().min(1).optional(),
  filled_date: z.string().optional(),
})
const returnActSchema = z.object({
  is_fix_bike: z.boolean(),
  is_fix_AKB_1: z.boolean(),
  is_fix_AKB_2: z.boolean(),
  damage_description: z.string().optional(),
  damage_amount: z.coerce.number().min(0).optional(),
  debt_term_days: z.coerce.number().int().min(0).optional(),
})

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const {
    selectedUser,
    userContracts,
    userPaymentSchedule,
    userReturnActs,
    isLoading,
    fetchUser,
    fetchUserContracts,
    fetchUserPaymentSchedule,
    fetchReturnActs,
    approveUser,
    rejectUser,
    createContract,
    signContract,
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState<'info' | 'contracts' | 'payments' | 'acts'>('info')
  const [rejectModal, setRejectModal] = useState(false)
  const [createContractModal, setCreateContractModal] = useState(false)
  const [contractModal, setContractModal] = useState<UserDocumentRead | null>(null)
  const [returnActModal, setReturnActModal] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const rejectForm = useForm<{ reason: string }>({ resolver: zodResolver(rejectSchema) })
  const createContractForm = useForm<z.infer<typeof contractSchema>>({ resolver: zodResolver(contractSchema) })
  const contractForm = useForm<z.infer<typeof contractSchema>>({ resolver: zodResolver(contractSchema) })
  const returnActForm = useForm<z.infer<typeof returnActSchema>>({
    resolver: zodResolver(returnActSchema),
    defaultValues: { is_fix_bike: false, is_fix_AKB_1: false, is_fix_AKB_2: false, damage_amount: 0, debt_term_days: 0 },
  })

  useEffect(() => {
    fetchUser(userId)
    fetchUserContracts(userId)
    fetchUserPaymentSchedule(userId)
    fetchReturnActs(userId)
  }, [userId])

  const fmtDate = (d: string | null) =>
    d ? format(new Date(d), 'd MMM yyyy', { locale: ru }) : '—'

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await approveUser(userId)
      toast.success('Пользователь одобрен')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (data: { reason: string }) => {
    setActionLoading(true)
    try {
      await rejectUser(userId, data.reason)
      setRejectModal(false)
      toast.success('Анкета отклонена')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateContract = async (data: z.infer<typeof contractSchema>) => {
    setActionLoading(true)
    try {
      await createContract(userId, {
        bike_serial: data.bike_serial || undefined,
        akb1_serial: data.akb1_serial || undefined,
        akb2_serial: data.akb2_serial || undefined,
        weeks_count: data.weeks_count || undefined,
        filled_date: data.filled_date || undefined,
      })
      setCreateContractModal(false)
      createContractForm.reset()
      toast.success('Договор создан')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateContract = async (data: z.infer<typeof contractSchema>) => {
    if (!contractModal) return
    setActionLoading(true)
    try {
      const { updateContract } = useAdminStore.getState()
      await updateContract(userId, contractModal.id, {
        bike_serial: data.bike_serial || undefined,
        akb1_serial: data.akb1_serial || undefined,
        akb2_serial: data.akb2_serial || undefined,
        weeks_count: data.weeks_count || undefined,
        filled_date: data.filled_date || undefined,
      })
      setContractModal(null)
      toast.success('Договор обновлён')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSignContract = async (contractId: number) => {
    if (!confirm('Подписать договор? Это создаст платёжный график.')) return
    setActionLoading(true)
    try {
      await signContract(userId, contractId)
      toast.success('Договор подписан, платёжный график создан')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateReturnAct = async (data: z.infer<typeof returnActSchema>) => {
    if (returnActModal === null) return
    setActionLoading(true)
    try {
      const payload: ReturnActCreateRequest = {
        is_fix_bike: data.is_fix_bike,
        is_fix_AKB_1: data.is_fix_AKB_1,
        is_fix_AKB_2: data.is_fix_AKB_2,
        damage_description: data.damage_description || null,
        damage_amount: data.damage_amount ?? 0,
        debt_term_days: data.debt_term_days ?? 0,
      }
      await useAdminStore.getState().createReturnAct(userId, returnActModal, payload)
      setReturnActModal(null)
      toast.success('Акт возврата создан')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading && !selectedUser) return <LoadingSpinner fullScreen />
  if (!selectedUser) return <p className="text-gray-500">Пользователь не найден.</p>

  const u = selectedUser

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/admin/users" className="text-sm text-brand-600 hover:underline">← Все пользователи</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{u.full_name ?? u.email}</h1>
          <p className="text-sm text-gray-400">{u.email} {u.phone && `· ${u.phone}`}</p>
        </div>
        <StatusBadge status={u.status} />
      </div>

      {/* Action buttons */}
      {u.status === 'pending' && (
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleApprove} isLoading={actionLoading}>Одобрить</Button>
          <Button variant="danger" onClick={() => setRejectModal(true)}>Отклонить</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {(['info', 'contracts', 'payments', 'acts'] as const).map((tab) => {
          const labels = { info: 'Данные', contracts: 'Договоры', payments: 'Платежи', acts: 'Акты возврата' }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ['Email', u.email],
            ['Телефон', u.phone ?? '—'],
            ['ФИО', u.full_name ?? '—'],
            ['Автоплатёж', u.autopay_enabled ? 'Включён' : 'Выключен'],
            ['Статус', u.status],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white border p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
          {u.status === 'rejected' && u.rejection_reason && (
            <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-gray-400">Причина отклонения</p>
              <p className="text-sm text-red-700 mt-0.5">{u.rejection_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Contracts tab */}
      {activeTab === 'contracts' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { createContractForm.reset(); setCreateContractModal(true) }}>
              + Создать договор
            </Button>
          </div>
          {userContracts.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Договор {c.contract_number ?? `#${c.id}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmtDate(c.filled_date)} → {fmtDate(c.end_date)} · {c.weeks_count ?? '?'} нед.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={c.signed ? 'approved' : 'pending'} />
                  {c.active && <span className="text-xs text-green-600 font-medium">Активен</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    contractForm.reset({
                      bike_serial: c.bike_serial ?? '',
                      akb1_serial: c.akb1_serial ?? '',
                      akb2_serial: c.akb2_serial ?? '',
                      weeks_count: c.weeks_count ?? undefined,
                      filled_date: c.filled_date ?? '',
                    })
                    setContractModal(c)
                  }}
                >
                  Редактировать
                </Button>
                {!c.signed && (
                  <Button size="sm" onClick={() => handleSignContract(c.id)} isLoading={actionLoading}>
                    Подписать
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => adminContractApi.downloadDocx(userId, c.id).catch((e) => toast.error(extractErrorMessage(e)))}
                >
                  Скачать .docx
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReturnActModal(c.id)}
                >
                  Акт возврата
                </Button>
              </div>
            </div>
          ))}
          {userContracts.length === 0 && (
            <p className="text-gray-400 text-sm py-6 text-center">Договоры не найдены</p>
          )}
        </div>
      )}

      {/* Payments tab */}
      {activeTab === 'payments' && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Дата</th>
                <th className="px-4 py-3 text-left">Сумма</th>
                <th className="px-4 py-3 text-left">Тип</th>
                <th className="px-4 py-3 text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {userPaymentSchedule.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{p.payment_number}</td>
                  <td className="px-4 py-3">{fmtDate(p.due_date)}</td>
                  <td className="px-4 py-3 font-medium">{p.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3 text-gray-500">
                    {{ rent: 'Аренда', damage: 'Ущерб', recalculation: 'Перерасчёт' }[p.payment_type] ?? p.payment_type}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {userPaymentSchedule.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">График пуст</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Return acts tab */}
      {activeTab === 'acts' && (
        <div className="flex flex-col gap-3">
          {userReturnActs.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white border shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  Акт {a.return_act_number ?? `#${a.id}`}
                </p>
                <span className="text-xs text-gray-400">{fmtDate(a.rent_end_date)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <span>Велосипед: {a.is_fix_bike ? '🔧 Требует ремонта' : '✅ OK'}</span>
                <span>АКБ1: {a.is_fix_akb_1 ? '🔧 Требует ремонта' : '✅ OK'}</span>
                <span>АКБ2: {a.is_fix_akb_2 ? '🔧 Требует ремонта' : '✅ OK'}</span>
                {a.damage_amount > 0 && <span>Ущерб: {a.damage_amount.toLocaleString('ru-RU')} ₽</span>}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adminReturnActApi.downloadDocx(userId, a.id).catch((e) => toast.error(extractErrorMessage(e)))}
              >
                Скачать .docx
              </Button>
            </div>
          ))}
          {userReturnActs.length === 0 && (
            <p className="text-gray-400 text-sm py-6 text-center">Актов возврата нет</p>
          )}
        </div>
      )}

      {/* Create contract modal */}
      <Modal isOpen={createContractModal} onClose={() => setCreateContractModal(false)} title="Создать договор">
        <form onSubmit={createContractForm.handleSubmit(handleCreateContract)} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Все поля опциональны — можно заполнить позже через редактирование.</p>
          <Input label="Серийный номер велосипеда" {...createContractForm.register('bike_serial')} />
          <Input label="АКБ 1" {...createContractForm.register('akb1_serial')} />
          <Input label="АКБ 2" {...createContractForm.register('akb2_serial')} />
          <Input label="Количество недель" type="number" {...createContractForm.register('weeks_count')} />
          <Input label="Дата начала" type="date" {...createContractForm.register('filled_date')} />
          <div className="flex gap-3">
            <Button type="submit" isLoading={actionLoading}>Создать</Button>
            <Button type="button" variant="secondary" onClick={() => setCreateContractModal(false)}>Отмена</Button>
          </div>
        </form>
      </Modal>

      {/* Reject modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Причина отклонения">
        <form onSubmit={rejectForm.handleSubmit(handleReject)} className="flex flex-col gap-4">
          <Input
            label="Причина"
            error={rejectForm.formState.errors.reason?.message}
            {...rejectForm.register('reason')}
          />
          <div className="flex gap-3">
            <Button type="submit" variant="danger" isLoading={actionLoading}>Отклонить</Button>
            <Button type="button" variant="secondary" onClick={() => setRejectModal(false)}>Отмена</Button>
          </div>
        </form>
      </Modal>

      {/* Edit contract modal */}
      <Modal isOpen={!!contractModal} onClose={() => setContractModal(null)} title="Редактировать договор">
        <form onSubmit={contractForm.handleSubmit(handleUpdateContract)} className="flex flex-col gap-4">
          <Input label="Серийный номер велосипеда" {...contractForm.register('bike_serial')} />
          <Input label="АКБ 1" {...contractForm.register('akb1_serial')} />
          <Input label="АКБ 2" {...contractForm.register('akb2_serial')} />
          <Input label="Количество недель" type="number" {...contractForm.register('weeks_count')} />
          <Input label="Дата начала" type="date" {...contractForm.register('filled_date')} />
          <div className="flex gap-3">
            <Button type="submit" isLoading={actionLoading}>Сохранить</Button>
            <Button type="button" variant="secondary" onClick={() => setContractModal(null)}>Отмена</Button>
          </div>
        </form>
      </Modal>

      {/* Return act modal */}
      <Modal isOpen={returnActModal !== null} onClose={() => setReturnActModal(null)} title="Создать акт возврата">
        <form onSubmit={returnActForm.handleSubmit(handleCreateReturnAct)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...returnActForm.register('is_fix_bike')} />
              Велосипед требует ремонта
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...returnActForm.register('is_fix_AKB_1')} />
              АКБ 1 требует ремонта
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...returnActForm.register('is_fix_AKB_2')} />
              АКБ 2 требует ремонта
            </label>
          </div>
          <Input label="Описание повреждений" {...returnActForm.register('damage_description')} />
          <Input label="Сумма ущерба (₽)" type="number" {...returnActForm.register('damage_amount')} />
          <Input label="Срок задолженности (дней)" type="number" {...returnActForm.register('debt_term_days')} />
          <div className="flex gap-3">
            <Button type="submit" isLoading={actionLoading}>Создать акт</Button>
            <Button type="button" variant="secondary" onClick={() => setReturnActModal(null)}>Отмена</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
