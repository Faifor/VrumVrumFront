import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

const passwordRules = z
  .string()
  .min(9, 'Минимум 9 символов')
  .regex(/[a-zA-Zа-яА-Я]/, 'Должна содержать букву')
  .regex(/\d/, 'Должна содержать цифру')
  .regex(/[^a-zA-Zа-яА-Я\d]/, 'Должна содержать спецсимвол')

const step1Schema = z.object({ email: z.string().email('Введите корректный email') })

const step2Schema = z
  .object({
    code: z.string().length(6, 'Код — 6 цифр'),
    password: passwordRules,
    password_repeat: z.string(),
  })
  .refine((d) => d.password === d.password_repeat, {
    message: 'Пароли не совпадают',
    path: ['password_repeat'],
  })

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) })

  const sendCode = async (data: Step1) => {
    setLoadingCode(true)
    try {
      await authApi.sendRegisterCode(data.email)
      setEmail(data.email)
      setStep(2)
      startCooldown()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoadingCode(false)
    }
  }

  const startCooldown = () => {
    setCooldown(30)
    const t = setInterval(() => {
      setCooldown((v) => { if (v <= 1) { clearInterval(t); return 0 } return v - 1 })
    }, 1000)
  }

  const resendCode = async () => {
    if (cooldown > 0) return
    setLoadingCode(true)
    try {
      await authApi.sendRegisterCode(email)
      startCooldown()
      toast.success('Код отправлен повторно')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoadingCode(false)
    }
  }

  const doRegister = async (data: Step2) => {
    setLoadingRegister(true)
    try {
      await authApi.register({ email, code: data.code, password: data.password, password_repeat: data.password_repeat })
      await login(email, data.password)
      navigate('/cabinet')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-navy-900 px-4">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-brand-400/10 dark:bg-brand-600/8 blur-3xl animate-float" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-400/8 dark:bg-indigo-600/8 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-[380px] animate-scale-up">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-2xl dark:shadow-black/40 p-8">

          {/* Logo & title */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-brand-lg mb-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Регистрация</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {step === 1 ? 'Шаг 1 из 2 — введите email' : 'Шаг 2 из 2 — подтверждение'}
            </p>
            {/* Step indicator */}
            <div className="flex justify-center gap-1.5 mt-3">
              <span className="h-1.5 w-6 rounded-full bg-brand-500" />
              <span className={`h-1.5 w-6 rounded-full transition-colors ${step === 2 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={form1.handleSubmit(sendCode)} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={form1.formState.errors.email?.message}
                {...form1.register('email')}
              />
              <Button type="submit" isLoading={loadingCode} size="lg" className="w-full">
                Получить код
              </Button>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Уже есть аккаунт?{' '}
                <Link to="/auth/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  Войти
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={form2.handleSubmit(doRegister)} className="flex flex-col gap-4">
              <div className="rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 px-4 py-3">
                <p className="text-sm text-brand-700 dark:text-brand-400">
                  Код отправлен на <strong>{email}</strong>
                </p>
              </div>
              <Input
                label="Код из письма"
                maxLength={6}
                inputMode="numeric"
                placeholder="123456"
                error={form2.formState.errors.code?.message}
                {...form2.register('code')}
              />
              <Input
                label="Пароль"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••"
                hint="Минимум 9 символов, буква, цифра, спецсимвол"
                error={form2.formState.errors.password?.message}
                {...form2.register('password')}
              />
              <Input
                label="Повторите пароль"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••"
                error={form2.formState.errors.password_repeat?.message}
                {...form2.register('password_repeat')}
              />
              <Button type="submit" isLoading={loadingRegister} size="lg" className="w-full">
                Создать аккаунт
              </Button>
              <button
                type="button"
                onClick={resendCode}
                disabled={cooldown > 0 || loadingCode}
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40 disabled:no-underline text-center"
              >
                {cooldown > 0 ? `Отправить повторно (${cooldown}с)` : 'Отправить код повторно'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
