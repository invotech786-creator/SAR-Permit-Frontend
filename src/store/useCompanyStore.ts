import { create } from 'zustand'

import { Network, Urls } from '../api-config'
import { showErrorMessage, showSuccessMessage } from '../components'
import { ICompany } from 'src/types'

interface IPagination {
  current: number
  pages: number
  total: number
}
const initalPagination: IPagination = {
  current: 1,
  pages: 0,
  total: 0
}

interface CompanyState {
  companies: ICompany[]
  company: ICompany | null
  pagination: IPagination
  loading: boolean

  setPagination: (pagination: Partial<IPagination>) => void
  resetPagination: () => void
  getCompanies: (filters?: any) => Promise<boolean>
  getCompany: (id: string) => Promise<boolean>
  createCompany: (body: Partial<ICompany>) => Promise<boolean>
  updateCompany: (id: string, body: Partial<ICompany>) => Promise<boolean>
  deleteCompany: (id: string) => Promise<boolean>
  deleteBulkCompanies: (companyIds: string[]) => Promise<boolean>
  toggleBulkCompaniesActivity: (companyIds: string[], status: boolean) => Promise<boolean>
}

const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  company: null,
  pagination: initalPagination,
  loading: false,

  setPagination: (pagination: Partial<IPagination>) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },

  resetPagination: () => {
    set({ pagination: initalPagination })
  },

  getCompanies: async (filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(Urls.company, null, filters)
      if (!response.ok) {
        showErrorMessage(response.data.message)

        return false
      }

      const { companies, ...rest } = response.data.data

      set({ companies, pagination: rest })

      return true
    } finally {
      set({ loading: false })
    }
  },

  getCompany: async (id: string) => {
    const response: any = await Network.get(`${Urls.company}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }
    set({ company: response.data.data.company })

    return true
  },

  createCompany: async body => {
    const response: any = await Network.post(Urls.company, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    // Refresh with current pagination
    const currentPagination = get().pagination
    await get().getCompanies({
      page: currentPagination.current,
      limit: currentPagination.total > 0 ? Math.ceil(currentPagination.total / currentPagination.pages) : 10
    })

    return true
  },
  updateCompany: async (id, body) => {
    const response: any = await Network.put(`${Urls.company}/${id}`, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    // Refresh with current pagination
    const currentPagination = get().pagination
    await get().getCompanies({
      page: currentPagination.current,
      limit: currentPagination.total > 0 ? Math.ceil(currentPagination.total / currentPagination.pages) : 10
    })

    return true
  },
  deleteCompany: async id => {
    const response: any = await Network.delete(`${Urls.company}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    // Refresh with current pagination
    const currentPagination = get().pagination
    await get().getCompanies({
      page: currentPagination.current,
      limit: currentPagination.total > 0 ? Math.ceil(currentPagination.total / currentPagination.pages) : 10
    })

    return true
  },

  deleteBulkCompanies: async (companyIds: string[]) => {
    const response: any = await Network.delete(`${Urls.company}/bulk-delete`, { ids: companyIds })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    // Refresh with current pagination
    const currentPagination = get().pagination
    await get().getCompanies({
      page: currentPagination.current,
      limit: currentPagination.total > 0 ? Math.ceil(currentPagination.total / currentPagination.pages) : 10
    })

    return true
  },

  toggleBulkCompaniesActivity: async (companyIds: string[], status: boolean) => {
    const response: any = await Network.put(`${Urls.company}/bulk/toggle-activity`, { ids: companyIds, status })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    // Refresh with current pagination
    const currentPagination = get().pagination
    await get().getCompanies({
      page: currentPagination.current,
      limit: currentPagination.total > 0 ? Math.ceil(currentPagination.total / currentPagination.pages) : 10
    })

    return true
  }
}))

export default useCompanyStore
