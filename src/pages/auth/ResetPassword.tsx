import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { useState } from 'react'

const schema = z
  .object({
    code: z.string().length(6, 'Код — 6 цифр'),
    new_password: z
      .string()
      .min(9, 'Минимум 9 символов')
      .regex(/[a-zA-Zа-яА-Я]/, 'Нужна буква')
      .regex(/\d/, 'Нужна цифра')
      .regex(/[^a-zA-Zа-яА-Я\d]/, 'Нужен спецсимвол'),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authApi.resetPassword({ email, code: data.code, new_password: data.new_password })
      toast.success('Пароль изменён! Войдите с новым паролем.')
      navigate('/auth/login')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Новый пароль</h1>
        <p className="text-sm text-gray-500 mb-6">Введите код из письма и придумайте новый пароль.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Код из письма" maxLength={6} inputMode="numeric" error={errors.code?.message} {...register('code')} />
          <Input label="Новый пароль" type="password" error={errors.new_password?.message} {...register('new_password')} />
          <Input label="Повторите пароль" type="password" error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" isLoading={loading} className="w-full">Сохранить пароль</Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          <Link to="/auth/login" className="text-brand-600 hover:underline">← Вернуться к входу</Link>
        </p>
      </div>
    </div>
  )
}
