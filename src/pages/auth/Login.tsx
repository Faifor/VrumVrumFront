import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

const schema = z.object({
  email:    z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-navy-900 px-4">

      {/* ── Animated background blobs ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-brand-400/10 dark:bg-brand-600/8 blur-3xl animate-float" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-400/8 dark:bg-indigo-600/8 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-300/6 dark:bg-brand-500/6 blur-2xl" />
      </div>

      {/* ── Card ─────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[380px] animate-scale-up">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl dark:shadow-black/40 p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-brand-lg mb-4">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Добро пожаловать
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Войдите в личный кабинет Vrum
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end -mt-1">
              <Link
                to="/auth/forgot-password"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
              Войти
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Нет аккаунта?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
