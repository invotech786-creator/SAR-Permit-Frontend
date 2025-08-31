import { create } from 'zustand'
import { Network, Urls } from '../api-config'
import { showErrorMessage, showSuccessMessage } from '../components'
import { IUser, IUserPayload } from 'src/types'

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

interface UserState {
  users: IUser[]
  user: IUser | null
  pagination: IPagination
  loading: boolean
  stats: {
    activeCount: number
    activePercentage: number
    inactiveCount: number
    inactivePercentage: number
  }

  setPagination: (pagination: Partial<IPagination>) => void
  resetPagination: () => void
  getUsers: (filters?: any) => Promise<boolean>
  getUser: (id: string) => Promise<boolean>
  createUser: (body: IUserPayload) => Promise<boolean>
  updateUser: (id: string, body: Partial<IUserPayload>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  deleteBulkUsers: (userIds: string[]) => Promise<boolean>
  toggleBulkUsersActivity: (userIds: string[], status: boolean) => Promise<boolean>
}

const useUserStore = create<UserState>((set, get) => ({
  // user management
  users: [],
  user: null,
  pagination: initalPagination,
  loading: false,
  stats: {
    activeCount: 0,
    activePercentage: 0,
    inactiveCount: 0,
    inactivePercentage: 0
  },
  getUsers: async (filters = {}) => {
    set({ loading: true })
    try {
      const response: any = await Network.get(Urls.user, null, {
        ...filters,
        populate: 'companyId,jobTitleId,roleId,departmentId'
      })
      if (!response.ok) {
        showErrorMessage(response.data.message)

        return false
      }

      const {
        users,
        activeCount,
        activePercentage,
        inactiveCount,
        inactivePercentage,
        totalUsers,
        current,
        pages,
        limit
      } = response.data.data

      set({
        users: users,
        pagination: {
          current: current || 1,
          pages: pages || 1,
          total: totalUsers || users?.length || 0
        },
        stats: {
          activeCount: activeCount || 0,
          activePercentage: activePercentage || 0,
          inactiveCount: inactiveCount || 0,
          inactivePercentage: inactivePercentage || 0
        }
      })

      return true
    } finally {
      set({ loading: false })
    }
  },

  setPagination: (pagination: Partial<IPagination>) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },
  resetPagination: () => {
    set({ pagination: initalPagination })
  },

  getUser: async (id: string) => {
    const response: any = await Network.get(`${Urls.user}/${id}`, null, {
      populate: 'companyId,jobTitleId,roleId,departmentId'
    })

    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    set({ user: response.data.data.user })

    return true
  },

  createUser: async body => {
    const formData = new FormData()

    // Add all text fields
    Object.keys(body).forEach(key => {
      const value = (body as any)[key]
      if (key === 'profilePic') {
        if (value instanceof File) {
          formData.append('profilePic', value)
        } else if (value === '') {
          // Send empty string for no image
          formData.append('profilePic', '')
        }
        // If value is undefined/null, don't append anything (no image)
      } else {
        formData.append(key, value)
      }
    })

    const response: any = await Network.post(Urls.user, formData)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getUsers()

    return true
  },

  updateUser: async (id, body) => {
    const formData = new FormData()

    // Add all text fields
    Object.keys(body).forEach(key => {
      const value = (body as any)[key]
      if (key === 'profilePic') {
        if (value instanceof File) {
          formData.append('profilePic', value)
        } else if (value === '') {
          // Send empty string to remove existing image
          formData.append('profilePic', '')
        }
        // If value is undefined/null, don't append anything (keeps existing image)
      } else {
        formData.append(key, value)
      }
    })

    const response: any = await Network.put(`${Urls.user}/${id}`, formData)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getUsers()

    return true
  },

  deleteUser: async (id: string) => {
    const response: any = await Network.delete(`${Urls.user}/${id}`)
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getUsers()

    return true
  },

  deleteBulkUsers: async (userIds: string[]) => {
    const response: any = await Network.delete(`${Urls.user}/bulk/delete`, { ids: userIds })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getUsers()

    return true
  },

  toggleBulkUsersActivity: async (userIds: string[], status: boolean) => {
    const response: any = await Network.put(`${Urls.user}/bulk/toggle-activity`, { ids: userIds, status })
    if (!response.ok) {
      showErrorMessage(response.data.message)

      return false
    }

    showSuccessMessage(response.data.message)
    await get().getUsers()

    return true
  }
}))

export default useUserStore
