import { api } from './client'
import type { UserDocumentRead, UserContractItem, UserDocumentUserUpdate } from '@/types'

export const documentApi = {
  getDocument: (documentId: number) =>
    api.get<UserDocumentRead>(`/users/me/document/${documentId}`),

  updateDocument: (payload: UserDocumentUserUpdate) =>
    api.put<UserDocumentRead>('/users/me/document', payload),

  submitDocument: () =>
    api.post<UserDocumentRead>('/users/me/document/submit'),

  getActiveContracts: () =>
    api.get<UserContractItem[]>('/users/me/documents/active'),

  downloadContractDocx: async (documentId: number): Promise<void> => {
    const response = await api.get(`/users/me/contract-docx/${documentId}`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)

    // iOS/Android browser UX: open in new tab instead of auto-download
    const ua = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
    if (isMobile) {
      window.open(url, '_blank')
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = `contract_${documentId}.docx`
      a.click()
    }
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
}
