import { create } from 'zustand'
import {
  adminUsersApi,
  adminDocApi,
  adminContractApi,
  adminReturnActApi,
  adminPaymentApi,
  locationsApi,
  bikesApi,
  batteriesApi,
  pricingApi,
} from '@/api/admin.api'
import type {
  UserWithDocumentSummary,
  UserDocumentRead,
  ContractPaymentRead,
  ReturnActRead,
  Location,
  Bike,
  Battery,
  BikePricing,
  DocumentStatus,
  AssetStatus,
  ReturnActCreateRequest,
} from '@/types'

interface AdminState {
  // Users
  users: UserWithDocumentSummary[]
  selectedUser: UserWithDocumentSummary | null
  userContracts: UserDocumentRead[]
  userPaymentSchedule: ContractPaymentRead[]
  userReturnActs: ReturnActRead[]

  // Inventory
  locations: Location[]
  bikes: Bike[]
  batteries: Battery[]
  pricing: BikePricing[]

  isLoading: boolean
  error: string | null

  // User actions
  fetchUsers: (status?: DocumentStatus | 'all') => Promise<void>
  fetchUser: (userId: number) => Promise<void>
  approveUser: (userId: number) => Promise<void>
  rejectUser: (userId: number, reason: string) => Promise<void>

  // Contract actions
  fetchUserContracts: (userId: number) => Promise<void>
  createContract: (
    userId: number,
    payload?: Partial<{
      bike_serial: string
      akb1_serial: string
      akb2_serial: string
      weeks_count: number
      filled_date: string
    }>,
  ) => Promise<void>
  updateContract: (
    userId: number,
    documentId: number,
    payload: Partial<{
      bike_serial: string
      akb1_serial: string
      akb2_serial: string
      weeks_count: number
      filled_date: string
    }>,
  ) => Promise<void>
  signContract: (userId: number, documentId: number) => Promise<void>

  // Return acts
  fetchReturnActs: (userId: number) => Promise<void>
  createReturnAct: (userId: number, documentId: number, payload: ReturnActCreateRequest) => Promise<void>

  // Payment schedule
  fetchUserPaymentSchedule: (userId: number) => Promise<void>

  // Inventory
  fetchLocations: () => Promise<void>
  createLocation: (payload: Omit<Location, 'id'>) => Promise<void>
  updateLocation: (id: number, payload: Partial<Omit<Location, 'id'>>) => Promise<void>
  deleteLocation: (id: number) => Promise<void>

  fetchBikes: (status?: AssetStatus) => Promise<void>
  createBike: (payload: Omit<Bike, 'id'>) => Promise<void>
  updateBike: (id: number, payload: Partial<Omit<Bike, 'id'>>) => Promise<void>
  deleteBike: (id: number) => Promise<void>
  setBikeStatus: (id: number, status: AssetStatus) => Promise<void>

  fetchBatteries: () => Promise<void>
  createBattery: (payload: Omit<Battery, 'id'>) => Promise<void>
  updateBattery: (id: number, payload: Partial<Omit<Battery, 'id'>>) => Promise<void>
  deleteBattery: (id: number) => Promise<void>

  fetchPricing: () => Promise<void>
  createPricing: (payload: Omit<BikePricing, 'id'>) => Promise<void>
  updatePricing: (id: number, payload: Partial<Omit<BikePricing, 'id'>>) => Promise<void>
  deletePricing: (id: number) => Promise<void>

  clearError: () => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  selectedUser: null,
  userContracts: [],
  userPaymentSchedule: [],
  userReturnActs: [],
  locations: [],
  bikes: [],
  batteries: [],
  pricing: [],
  isLoading: false,
  error: null,

  fetchUsers: async (status = 'all') => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await adminUsersApi.list(status)
      set({ users: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Не удалось загрузить пользователей' })
    }
  },

  fetchUser: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await adminUsersApi.get(userId)
      set({ selectedUser: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Не удалось загрузить пользователя' })
    }
  },

  approveUser: async (userId) => {
    await adminDocApi.approve(userId)
    await get().fetchUser(userId)
  },

  rejectUser: async (userId, reason) => {
    await adminDocApi.reject(userId, reason)
    await get().fetchUser(userId)
  },

  fetchUserContracts: async (userId) => {
    const { data } = await adminContractApi.list(userId)
    set({ userContracts: data })
  },

  createContract: async (userId, payload = {}) => {
    await adminContractApi.create(userId, payload)
    await get().fetchUserContracts(userId)
  },

  updateContract: async (userId, documentId, payload) => {
    await adminDocApi.update(userId, documentId, payload)
    await get().fetchUserContracts(userId)
  },

  signContract: async (userId, documentId) => {
    await adminContractApi.sign(userId, documentId)
    await get().fetchUserContracts(userId)
  },

  fetchReturnActs: async (userId) => {
    const { data } = await adminReturnActApi.list(userId)
    set({ userReturnActs: data })
  },

  createReturnAct: async (userId, documentId, payload) => {
    await adminReturnActApi.create(userId, documentId, payload)
    await get().fetchReturnActs(userId)
  },

  fetchUserPaymentSchedule: async (userId) => {
    const { data } = await adminPaymentApi.getSchedule(userId)
    set({ userPaymentSchedule: data })
  },

  // ─── Locations ─────────────────────────────────────────────────────────────

  fetchLocations: async () => {
    const { data } = await locationsApi.list()
    set({ locations: data })
  },

  createLocation: async (payload) => {
    await locationsApi.create(payload)
    await get().fetchLocations()
  },

  updateLocation: async (id, payload) => {
    await locationsApi.update(id, payload)
    await get().fetchLocations()
  },

  deleteLocation: async (id) => {
    await locationsApi.delete(id)
    set((s) => ({ locations: s.locations.filter((l) => l.id !== id) }))
  },

  // ─── Bikes ─────────────────────────────────────────────────────────────────

  fetchBikes: async (status) => {
    const { data } = await bikesApi.list(status)
    set({ bikes: data })
  },

  createBike: async (payload) => {
    await bikesApi.create(payload)
    await get().fetchBikes()
  },

  updateBike: async (id, payload) => {
    await bikesApi.update(id, payload)
    await get().fetchBikes()
  },

  deleteBike: async (id) => {
    await bikesApi.delete(id)
    set((s) => ({ bikes: s.bikes.filter((b) => b.id !== id) }))
  },

  setBikeStatus: async (id, status) => {
    await bikesApi.setStatus(id, status)
    set((s) => ({
      bikes: s.bikes.map((b) => (b.id === id ? { ...b, status } : b)),
    }))
  },

  // ─── Batteries ─────────────────────────────────────────────────────────────

  fetchBatteries: async () => {
    const { data } = await batteriesApi.list()
    set({ batteries: data })
  },

  createBattery: async (payload) => {
    await batteriesApi.create(payload)
    await get().fetchBatteries()
  },

  updateBattery: async (id, payload) => {
    await batteriesApi.update(id, payload)
    await get().fetchBatteries()
  },

  deleteBattery: async (id) => {
    await batteriesApi.delete(id)
    set((s) => ({ batteries: s.batteries.filter((b) => b.id !== id) }))
  },

  // ─── Pricing ───────────────────────────────────────────────────────────────

  fetchPricing: async () => {
    const { data } = await pricingApi.list()
    set({ pricing: data })
  },

  createPricing: async (payload) => {
    await pricingApi.create(payload)
    await get().fetchPricing()
  },

  updatePricing: async (id, payload) => {
    await pricingApi.update(id, payload)
    await get().fetchPricing()
  },

  deletePricing: async (id) => {
    await pricingApi.delete(id)
    set((s) => ({ pricing: s.pricing.filter((p) => p.id !== id) }))
  },

  clearError: () => set({ error: null }),
}))
