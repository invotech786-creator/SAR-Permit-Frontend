import { create } from 'zustand'
import { ReviewTableRow } from '../types/review'
import { fetchEvidenceCategories } from '../services/reviewService'

interface ReviewState {
  tableRows: ReviewTableRow[]
  loading: boolean
  error: string | null
  fetchEvidenceCategories: () => Promise<boolean>
  clearData: () => void
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  tableRows: [],
  loading: false,
  error: null,

  fetchEvidenceCategories: async () => {
    try {
      set({ loading: true, error: null })
      const tableRows = await fetchEvidenceCategories()
      set({ tableRows, loading: false })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evidence categories'
      set({ error: errorMessage, loading: false })
      return false
    }
  },

  clearData: () => {
    set({ tableRows: [], loading: false, error: null })
  }
}))
