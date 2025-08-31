import { create } from 'zustand'

import { Network, Urls } from '../api-config'
import { showErrorMessage } from '../components'
import { IRevision, IRevisionResponse } from 'src/types'

interface RevisionState {
  revisions: IRevision[]
  loading: boolean
  getEntityHistory: (modelType: string, entityId: string) => Promise<IRevision[]>
  getModelHistory: (modelType: string, filters?: any) => Promise<IRevisionResponse>
}

const useRevisionStore = create<RevisionState>((set, get) => ({
  revisions: [],
  loading: false,

  getEntityHistory: async (modelType: string, entityId: string) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(`${Urls.revisions}/${modelType}/history/entity/${entityId}`)
      if (!response.ok) {
        showErrorMessage(response.data.message)
        return []
      }

      const revisions = response.data.data || []
      set({ revisions })
      return revisions
    } catch (error) {
      console.error('Error fetching entity history:', error)
      showErrorMessage('Failed to fetch revision history')
      return []
    } finally {
      set({ loading: false })
    }
  },

  getModelHistory: async (modelType: string, filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(`${Urls.revisions}/${modelType}/history`, null, filters)
      if (!response.ok) {
        showErrorMessage(response.data.message)
        return { revisions: [], current: 1, pages: 0, total: 0 }
      }

      const data = response.data.data
      set({ revisions: data.revisions || [] })
      return data
    } catch (error) {
      console.error('Error fetching model history:', error)
      showErrorMessage('Failed to fetch revision history')
      return { revisions: [], current: 1, pages: 0, total: 0 }
    } finally {
      set({ loading: false })
    }
  }
}))

export default useRevisionStore