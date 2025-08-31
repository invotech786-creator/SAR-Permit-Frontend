import { create } from 'zustand'

import { Network, Urls } from '../api-config'
import { showErrorMessage, showSuccessMessage } from '../components'
import { ILocation } from 'src/types'

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

interface LocationState {
  locations: ILocation[]
  location: ILocation | null
  pagination: IPagination
  loading: boolean

  setPagination: (pagination: Partial<IPagination>) => void
  resetPagination: () => void
  getLocations: (filters?: any) => Promise<boolean>
  getLocation: (id: string) => Promise<boolean>
  createLocation: (body: Partial<ILocation>) => Promise<boolean>
  updateLocation: (id: string, body: Partial<ILocation>) => Promise<boolean>
  deleteLocation: (id: string) => Promise<boolean>
  deleteBulkLocations: (locationIds: string[]) => Promise<boolean>
  toggleBulkLocationsActivity: (locationIds: string[], status: boolean) => Promise<boolean>
}

const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  location: null,
  pagination: initalPagination,
  loading: false,

  setPagination: (pagination: Partial<IPagination>) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },

  resetPagination: () => {
    set({ pagination: initalPagination })
  },

  getLocations: async (filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(Urls.location, null, filters)
      if (!response.ok) {
        showErrorMessage(response.data.message)

        return false
      }

      // Handle direct array response (locations API returns data directly as array)
      const locations = response.data.data || response.data || []

      set({ locations })

      return true
    } finally {
      set({ loading: false })
    }
  },

  getLocation: async (id: string) => {
    const response: any = await Network.get(`${Urls.location}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }
    set({ location: response.data.data.location })

    return true
  },

  createLocation: async body => {
    const response: any = await Network.post(Urls.location, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getLocations()

    return true
  },
  updateLocation: async (id, body) => {
    const response: any = await Network.put(`${Urls.location}/${id}`, body)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getLocations()

    return true
  },
  deleteLocation: async (id) => {
    const response: any = await Network.delete(`${Urls.location}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getLocations()

    return true
  },

  deleteBulkLocations: async (locationIds: string[]) => {
    const response: any = await Network.delete(`${Urls.location}/bulk-delete`, { ids: locationIds })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getLocations()

    return true
  },

  toggleBulkLocationsActivity: async (locationIds: string[], status: boolean) => {
    const response: any = await Network.put(`${Urls.location}/bulk/toggle-activity`, { ids: locationIds, status })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getLocations()

    return true
  }
}))

export default useLocationStore