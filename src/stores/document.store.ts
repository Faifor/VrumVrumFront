import { create } from 'zustand'
import { documentApi } from '@/api/document.api'
import type { UserDocumentRead, UserContractItem, UserDocumentUserUpdate } from '@/types'

interface DocumentState {
  document: UserDocumentRead | null
  contracts: UserContractItem[]
  isLoading: boolean
  error: string | null

  fetchDocument: (documentId: number) => Promise<void>
  fetchActiveContracts: () => Promise<void>
  updateDocument: (payload: UserDocumentUserUpdate) => Promise<void>
  submitDocument: () => Promise<void>
  clearError: () => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  contracts: [],
  isLoading: false,
  error: null,

  fetchDocument: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await documentApi.getDocument(documentId)
      set({ document: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Не удалось загрузить документ' })
    }
  },

  fetchActiveContracts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await documentApi.getActiveContracts()
      set({ contracts: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Не удалось загрузить контракты' })
    }
  },

  updateDocument: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await documentApi.updateDocument(payload)
      set({ document: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  submitDocument: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await documentApi.submitDocument()
      set({ document: data, isLoading: false })
      // Reload contracts list
      const { data: contracts } = await documentApi.getActiveContracts()
      set({ contracts })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
