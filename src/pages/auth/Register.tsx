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
      setCooldown((v) => {
        if (v <= 1) { clearInterval(t); return 0 }
        return v - 1
      })
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
      // Auto-login after register
      await login(email, data.password)
      navigate('/cabinet')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-600">Vrum</h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === 1 ? 'Регистрация — шаг 1 из 2' : `Регистрация — шаг 2 из 2`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={form1.handleSubmit(sendCode)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={form1.formState.errors.email?.message}
              {...form1.register('email')}
            />
            <Button type="submit" isLoading={loadingCode} className="w-full mt-2">
              Получить код
            </Button>
            <p className="text-center text-sm text-gray-400">
              Уже есть аккаунт?{' '}
              <Link to="/auth/login" className="text-brand-600 hover:underline">
                Войти
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={form2.handleSubmit(doRegister)} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Код отправлен на <strong>{email}</strong>
            </p>
            <Input
              label="Код из письма"
              maxLength={6}
              inputMode="numeric"
              error={form2.formState.errors.code?.message}
              {...form2.register('code')}
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete="new-password"
              hint="Минимум 9 символов, буква, цифра, спецсимвол"
              error={form2.formState.errors.password?.message}
              {...form2.register('password')}
            />
            <Input
              label="Повторите пароль"
              type="password"
              autoComplete="new-password"
              error={form2.formState.errors.password_repeat?.message}
              {...form2.register('password_repeat')}
            />
            <Button type="submit" isLoading={loadingRegister} className="w-full mt-2">
              Создать аккаунт
            </Button>
            <button
              type="button"
              onClick={resendCode}
              disabled={cooldown > 0 || loadingCode}
              className="text-sm text-brand-600 hover:underline disabled:opacity-40 disabled:no-underline"
            >
              {cooldown > 0 ? `Отправить повторно (${cooldown}с)` : 'Отправить код повторно'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
