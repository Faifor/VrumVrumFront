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
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-600">Vrum</h1>
          <p className="mt-1 text-sm text-gray-500">Войдите в личный кабинет</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Войти
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <Link to="/auth/forgot-password" className="text-brand-600 hover:underline">
            Забыли пароль?
          </Link>
          <span className="text-gray-400">
            Нет аккаунта?{' '}
            <Link to="/auth/register" className="text-brand-600 hover:underline">
              Зарегистрироваться
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
