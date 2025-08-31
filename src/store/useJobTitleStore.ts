import { create } from 'zustand'
import { Network, Urls } from '../api-config'
import { showErrorMessage, showSuccessMessage } from '../components'
import { IJobTitle } from 'src/types'

interface IPagination {
  current: number
  pages: number
  total: number
}

const initialPagination: IPagination = {
  current: 1,
  pages: 0,
  total: 0
}

interface JobTitleState {
  jobTitles: IJobTitle[]
  pagination: IPagination
  loading: boolean

  setPagination: (pagination: Partial<IPagination>) => void
  resetPagination: () => void
  getJobTitles: (filters?: any) => Promise<boolean>
  getJobTitle: (id: string) => Promise<boolean>
  createJobTitle: (body: Partial<IJobTitle>) => Promise<boolean>
  updateJobTitle: (id: string, body: Partial<IJobTitle>) => Promise<boolean>
  deleteJobTitle: (id: string) => Promise<boolean>
  deleteBulkJobTitles: (jobTitleIds: string[]) => Promise<boolean>
  toggleBulkJobTitlesActivity: (jobTitleIds: string[], status: boolean) => Promise<boolean>
}

const useJobTitleStore = create<JobTitleState>((set, get) => ({
  jobTitles: [],
  pagination: initialPagination,
  loading: false,

  setPagination: (pagination: Partial<IPagination>) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },

  resetPagination: () => {
    set({ pagination: initialPagination })
  },

  getJobTitles: async (filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(Urls.jobTitle, undefined, filters)
      if (!response.ok) {
        showErrorMessage(response.data.message)

        return false
      }

      // The backend returns job titles array directly in response.data
      const jobTitles = response.data.data || []
      set({ jobTitles })

      return true
    } finally {
      set({ loading: false })
    }
  },

  getJobTitle: async (id: string) => {
    const response: any = await Network.get(`${Urls.jobTitle}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    return true
  },

  createJobTitle: async body => {
    const response: any = await Network.post(Urls.jobTitle, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getJobTitles()

    return true
  },

  updateJobTitle: async (id: string, body: Partial<IJobTitle>) => {
    const response: any = await Network.put(`${Urls.jobTitle}/${id}`, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getJobTitles()

    return true
  },

  deleteJobTitle: async (id) => {
    const response: any = await Network.delete(`${Urls.jobTitle}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getJobTitles()

    return true
  },

  deleteBulkJobTitles: async (jobTitleIds: string[]) => {
    const response: any = await Network.delete(`${Urls.jobTitle}/bulk/delete`, { ids: jobTitleIds })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getJobTitles()

    return true
  },

  toggleBulkJobTitlesActivity: async (jobTitleIds: string[], status: boolean) => {
    const response: any = await Network.put(`${Urls.jobTitle}/bulk/toggle-activity`, { ids: jobTitleIds, status })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getJobTitles()

    return true
  }
}))

export default useJobTitleStore
