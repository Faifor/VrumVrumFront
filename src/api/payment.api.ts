import { api } from './client'
import type {
  ContractPaymentRead,
  OrderRead,
  CreatePaymentRequest,
  CreatePaymentResponse,
} from '@/types'

export const paymentApi = {
  getSchedule: () =>
    api.get<ContractPaymentRead[]>('/api/payments/schedule'),

  getScheduleItem: (id: number) =>
    api.get<ContractPaymentRead>(`/api/payments/schedule/${id}`),

  createPayment: (payload: CreatePaymentRequest) =>
    api.post<CreatePaymentResponse>('/api/payments/create', payload),

  getOrder: (orderId: number) =>
    api.get<OrderRead>(`/api/orders/${orderId}`),

  recalcOrder: (orderId: number, targetAmount: number) =>
    api.post(`/api/recalc/${orderId}`, { target_amount: targetAmount }),

  enableAutopay: (paymentMethodId?: string) =>
    api.post<{ detail: string; payment_method_id: string }>('/api/autopay/enable', {
      payment_method_id: paymentMethodId ?? null,
    }),

  disableAutopay: () =>
    api.post<{ detail: string }>('/api/autopay/disable'),

  chargeAutopay: (payload: { schedule_payment_id: number; return_url?: string }) =>
    api.post<CreatePaymentResponse>('/api/autopay/charge', payload),
}
