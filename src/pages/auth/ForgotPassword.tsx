import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { extractErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { useState } from 'react'

const schema = z.object({ email: z.string().email('Введите корректный email') })

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true)
    try {
      await authApi.sendPasswordReset(email)
      toast.success('Код для сброса пароля отправлен на почту')
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Сброс пароля</h1>
        <p className="text-sm text-gray-500 mb-6">Введите email, и мы отправим код для сброса пароля.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" isLoading={loading} className="w-full">
            Отправить код
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          <Link to="/auth/login" className="text-brand-600 hover:underline">← Вернуться к входу</Link>
        </p>
      </div>
    </div>
  )
}
