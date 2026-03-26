import { api } from './client'
import type {
  UserWithDocumentSummary,
  UserDocumentRead,
  ContractPaymentRead,
  ReturnActRead,
  ReturnActCreateRequest,
  Location,
  Bike,
  Battery,
  BikePricing,
  AssetStatus,
  DocumentStatus,
} from '@/types'

// ─── Users ────────────────────────────────────────────────────────────────────

export const adminUsersApi = {
  list: (status: DocumentStatus | 'all' = 'all') =>
    api.get<UserWithDocumentSummary[]>('/admin/users', { params: { status } }),

  get: (userId: number) =>
    api.get<UserWithDocumentSummary>(`/admin/users/${userId}`),
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const adminDocApi = {
  get: (userId: number, documentId: number) =>
    api.get<UserDocumentRead>(`/admin/users/${userId}/document/${documentId}`),

  update: (
    userId: number,
    documentId: number,
    payload: Partial<{
      bike_serial: string
      akb1_serial: string
      akb2_serial: string
      weeks_count: number
      filled_date: string
    }>,
  ) => api.put<UserDocumentRead>(`/admin/users/${userId}/document`, payload, {
    params: { document_id: documentId },
  }),

  approve: (userId: number) =>
    api.post<UserDocumentRead>(`/admin/users/${userId}/document/approve`),

  reject: (userId: number, reason: string) =>
    api.post<UserDocumentRead>(`/admin/users/${userId}/document/reject`, { reason }),
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export const adminContractApi = {
  list: (userId: number) =>
    api.get<UserDocumentRead[]>(`/admin/users/${userId}/documents`),

  create: (
    userId: number,
    payload: Partial<{
      bike_serial: string
      akb1_serial: string
      akb2_serial: string
      weeks_count: number
      filled_date: string
    }> = {},
  ) => api.post<UserDocumentRead>(`/admin/users/${userId}/contracts`, payload),

  sign: (userId: number, documentId: number) =>
    api.post<UserDocumentRead>(`/admin/users/${userId}/documents/${documentId}/sign`),

  downloadDocx: async (userId: number, documentId: number): Promise<void> => {
    const response = await api.get(
      `/admin/users/${userId}/contract-docx/${documentId}`,
      { responseType: 'blob' },
    )
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract_${documentId}.docx`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
}

// ─── Return Acts ─────────────────────────────────────────────────────────────

export const adminReturnActApi = {
  create: (userId: number, documentId: number, payload: ReturnActCreateRequest) =>
    api.post<ReturnActRead>(`/admin/users/${userId}/contracts/${documentId}/return-acts`, payload),

  list: (userId: number) =>
    api.get<ReturnActRead[]>(`/admin/users/${userId}/return-acts`),

  get: (userId: number, actId: number) =>
    api.get<ReturnActRead>(`/admin/users/${userId}/return-acts/${actId}`),

  downloadDocx: async (userId: number, actId: number): Promise<void> => {
    const response = await api.get(
      `/admin/users/${userId}/return-acts/${actId}/docx`,
      { responseType: 'blob' },
    )
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `return_act_${actId}.docx`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
}

// ─── Payments ────────────────────────────────────────────────────────────────

export const adminPaymentApi = {
  getSchedule: (userId: number) =>
    api.get<ContractPaymentRead[]>(`/admin/users/${userId}/payment-schedule`),
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export const locationsApi = {
  list: () => api.get<Location[]>('/admin/locations'),
  create: (payload: Omit<Location, 'id'>) => api.post<Location>('/admin/locations', payload),
  update: (id: number, payload: Partial<Omit<Location, 'id'>>) =>
    api.put<Location>(`/admin/locations/${id}`, payload),
  delete: (id: number) => api.delete(`/admin/locations/${id}`),
}

export const bikesApi = {
  list: (status?: AssetStatus) =>
    api.get<Bike[]>('/admin/bikes', { params: status ? { status } : undefined }),
  create: (payload: Omit<Bike, 'id'>) => api.post<Bike>('/admin/bikes', payload),
  get: (id: number) => api.get<Bike>(`/admin/bikes/${id}`),
  update: (id: number, payload: Partial<Omit<Bike, 'id'>>) =>
    api.put<Bike>(`/admin/bikes/${id}`, payload),
  delete: (id: number) => api.delete(`/admin/bikes/${id}`),
  setStatus: (id: number, status: AssetStatus) =>
    api.patch<Bike>(`/admin/bikes/${id}/status`, { status }),
}

export const batteriesApi = {
  list: () => api.get<Battery[]>('/admin/batteries'),
  create: (payload: Omit<Battery, 'id'>) => api.post<Battery>('/admin/batteries', payload),
  update: (id: number, payload: Partial<Omit<Battery, 'id'>>) =>
    api.put<Battery>(`/admin/batteries/${id}`, payload),
  delete: (id: number) => api.delete(`/admin/batteries/${id}`),
  setStatus: (id: number, status: AssetStatus) =>
    api.patch<Battery>(`/admin/batteries/${id}/status`, { status }),
}

export const pricingApi = {
  list: (typeId?: number) =>
    api.get<BikePricing[]>('/admin/bike-pricing', { params: typeId ? { type_id: typeId } : undefined }),
  create: (payload: Omit<BikePricing, 'id'>) => api.post<BikePricing>('/admin/bike-pricing', payload),
  update: (id: number, payload: Partial<Omit<BikePricing, 'id'>>) =>
    api.put<BikePricing>(`/admin/bike-pricing/${id}`, payload),
  delete: (id: number) => api.delete(`/admin/bike-pricing/${id}`),
}
