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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-navy-900 px-4">

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-brand-400/10 dark:bg-brand-600/8 blur-3xl animate-float" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-400/8 dark:bg-indigo-600/8 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-[380px] animate-scale-up">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl dark:shadow-black/40 p-8">

          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-brand-lg mb-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Новый пароль</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Введите код из письма и придумайте новый пароль
            </p>
          </div>

          {email && (
            <div className="mb-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 px-4 py-3">
              <p className="text-sm text-brand-700 dark:text-brand-400">
                Код отправлен на <strong>{email}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Код из письма"
              maxLength={6}
              inputMode="numeric"
              placeholder="123456"
              error={errors.code?.message}
              {...register('code')}
            />
            <Input
              label="Новый пароль"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              error={errors.new_password?.message}
              {...register('new_password')}
            />
            <Input
              label="Повторите пароль"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              Сохранить пароль
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/auth/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              ← Вернуться к входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
