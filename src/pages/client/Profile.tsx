import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth.store'
import { useDocumentStore } from '@/stores/document.store'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatusBadge from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/Toast'
import type { UserDocumentUserUpdate } from '@/types'

const schema = z.object({
  last_name: z.string().min(1, 'Обязательное поле'),
  first_name: z.string().min(1, 'Обязательное поле'),
  patronymic: z.string().min(1, 'Обязательное поле'),
  inn: z.string().regex(/^\d{12}$/, 'ИНН — 12 цифр'),
  registration_address: z.string().min(5, 'Укажите адрес регистрации'),
  residential_address: z.string().min(5, 'Укажите адрес проживания'),
  passport: z.string().regex(/^\d{10}$/, 'Серия и номер — 10 цифр'),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +79991234567'),
  bank_account: z.string().regex(/^\d{20}$/, 'Номер счёта — 20 цифр'),
})

type FormData = z.infer<typeof schema>

function splitFullName(full: string | null) {
  if (!full) return { last_name: '', first_name: '', patronymic: '' }
  const parts = full.trim().split(/\s+/)
  return { last_name: parts[0] ?? '', first_name: parts[1] ?? '', patronymic: parts.slice(2).join(' ') ?? '' }
}

export default function ProfilePage() {
  const { me, refreshMe } = useAuthStore()
  const { updateDocument, submitDocument, isLoading } = useDocumentStore()
  const [submitting, setSubmitting] = useState(false)

  const isEditable = me?.status === 'draft' || me?.status === 'rejected'

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (me) {
      const name = splitFullName(me.full_name)
      reset({
        last_name: name.last_name,
        first_name: name.first_name,
        patronymic: name.patronymic,
        inn: me.inn ?? '',
        registration_address: me.registration_address ?? '',
        residential_address: me.residential_address ?? '',
        passport: me.passport ?? '',
        phone: me.phone ?? '',
        bank_account: me.bank_account ?? '',
      })
    }
  }, [me, reset])

  const onSave = async (data: FormData) => {
    try {
      const payload: UserDocumentUserUpdate = {
        last_name: data.last_name,
        first_name: data.first_name,
        patronymic: data.patronymic,
        inn: parseInt(data.inn),
        registration_address: data.registration_address,
        residential_address: data.residential_address,
        passport: parseInt(data.passport),
        phone: data.phone,
        bank_account: parseInt(data.bank_account),
      }
      await updateDocument(payload)
      await refreshMe()
      toast.success('Данные сохранены')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  const onSubmit = async () => {
    if (!confirm('Отправить анкету на проверку? После отправки изменить данные будет нельзя.')) return
    setSubmitting(true)
    try {
      await submitDocument()
      await refreshMe()
      toast.success('Анкета отправлена на проверку')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Анкета</h1>
        {me?.status && <StatusBadge status={me.status} />}
      </div>

      {/* Rejection reason */}
      {me?.status === 'rejected' && me.rejection_reason && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-400">
          <strong>Причина отклонения: </strong>{me.rejection_reason}
        </div>
      )}

      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Фамилия"  disabled={!isEditable} error={errors.last_name?.message}  {...register('last_name')} />
          <Input label="Имя"      disabled={!isEditable} error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Отчество" disabled={!isEditable} error={errors.patronymic?.message} {...register('patronymic')} />
        </div>
        <Input label="ИНН" disabled={!isEditable} inputMode="numeric" hint="12 цифр" error={errors.inn?.message} {...register('inn')} />
        <Input label="Адрес регистрации" disabled={!isEditable} error={errors.registration_address?.message} {...register('registration_address')} />
        <Input label="Адрес проживания"  disabled={!isEditable} error={errors.residential_address?.message}  {...register('residential_address')} />
        <Input label="Серия и номер паспорта" disabled={!isEditable} inputMode="numeric" hint="10 цифр без пробелов" error={errors.passport?.message} {...register('passport')} />
        <Input label="Телефон" disabled={!isEditable} hint="+79991234567" error={errors.phone?.message} {...register('phone')} />
        <Input label="Номер банковского счёта" disabled={!isEditable} inputMode="numeric" hint="20 цифр" error={errors.bank_account?.message} {...register('bank_account')} />

        {isEditable && (
          <div className="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex gap-3 mt-2">
            <Button type="submit" variant="secondary" isLoading={isLoading}>Сохранить</Button>
            <Button type="button" onClick={onSubmit} isLoading={submitting}>Отправить на проверку</Button>
          </div>
        )}
      </form>
    </div>
  )
}
