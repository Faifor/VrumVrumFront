import { create } from 'zustand'
import { paymentApi } from '@/api/payment.api'
import type { ContractPaymentRead, CreatePaymentResponse } from '@/types'

interface PaymentState {
  schedule: ContractPaymentRead[]
  isLoading: boolean
  error: string | null
  pendingPayment: CreatePaymentResponse | null

  fetchSchedule: () => Promise<void>
  payScheduleItem: (schedulePaymentId: number, amount: number, returnUrl: string) => Promise<CreatePaymentResponse>
  enableAutopay: (paymentMethodId?: string) => Promise<void>
  disableAutopay: () => Promise<void>
  setPendingPayment: (p: CreatePaymentResponse | null) => void
  clearError: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  schedule: [],
  isLoading: false,
  error: null,
  pendingPayment: null,

  fetchSchedule: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await paymentApi.getSchedule()
      set({ schedule: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Не удалось загрузить платёжный график' })
    }
  },

  payScheduleItem: async (schedulePaymentId, amount, returnUrl) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await paymentApi.createPayment({
        schedule_payment_id: schedulePaymentId,
        amount,
        return_url: returnUrl,
        save_payment_method: true,
      })
      set({ pendingPayment: data, isLoading: false })
      return data
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  enableAutopay: async (paymentMethodId) => {
    await paymentApi.enableAutopay(paymentMethodId)
  },

  disableAutopay: async () => {
    await paymentApi.disableAutopay()
  },

  setPendingPayment: (p) => set({ pendingPayment: p }),
  clearError: () => set({ error: null }),
}))
