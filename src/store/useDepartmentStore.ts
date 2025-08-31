import { create } from 'zustand'

import { Network, Urls } from '../api-config'
import { showErrorMessage, showSuccessMessage } from '../components'
import { IDepartment } from 'src/types'

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

interface DepartmentState {
  departments: IDepartment[]
  department: IDepartment | null
  pagination: IPagination
  loading: boolean

  setPagination: (pagination: Partial<IPagination>) => void
  resetPagination: () => void
  getDepartments: (filters?: any) => Promise<boolean>
  getDepartment: (id: string) => Promise<boolean>
  createDepartment: (body: Partial<IDepartment>) => Promise<boolean>
  updateDepartment: (id: string, body: Partial<IDepartment>) => Promise<boolean>
  deleteDepartment: (id: string) => Promise<boolean>
  deleteBulkDepartments: (departmentIds: string[]) => Promise<boolean>
  toggleBulkDepartmentsActivity: (departmentIds: string[], status: boolean) => Promise<boolean>
  updateDepartmentSequences: (updates: Array<{ departmentId: string; sequence: number }>) => Promise<boolean>
}

const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  department: null,
  pagination: initalPagination,
  loading: false,

  setPagination: (pagination: Partial<IPagination>) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },

  resetPagination: () => {
    set({ pagination: initalPagination })
  },

  getDepartments: async (filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(Urls.department, null, filters)
      if (!response.ok) {
        showErrorMessage(response.data.message)

        return false
      }

      // Handle direct array response
      const departments = response.data.data || []
      const pagination = {
        current: 1,
        pages: 1,
        total: departments.length
      }

      set({ departments, pagination })

      return true
    } finally {
      set({ loading: false })
    }
  },

  getDepartment: async (id: string) => {
    const response: any = await Network.get(`${Urls.department}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }
    set({ department: response.data.data.department })

    return true
  },

  createDepartment: async body => {
    const response: any = await Network.post(Urls.department, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  },
  updateDepartment: async (id, body) => {
    const response: any = await Network.put(`${Urls.department}/${id}`, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  },
  deleteDepartment: async id => {
    const response: any = await Network.delete(`${Urls.department}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  },

  deleteBulkDepartments: async (departmentIds: string[]) => {
    const response: any = await Network.delete(`${Urls.department}/bulk/delete`, { ids: departmentIds })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  },

  toggleBulkDepartmentsActivity: async (departmentIds: string[], status: boolean) => {
    const response: any = await Network.put(`${Urls.department}/bulk/toggle-activity`, { ids: departmentIds, status })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  },

  updateDepartmentSequences: async (updates: Array<{ departmentId: string; sequence: number }>) => {
    const response: any = await Network.put(Urls.departmentSequences, { updates })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getDepartments()

    return true
  }
}))

export default useDepartmentStore
