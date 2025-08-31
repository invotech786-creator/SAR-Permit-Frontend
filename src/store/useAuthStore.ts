import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { Network, Urls } from '../api-config'
import { showErrorMessage } from '../components'

interface AuthState {
  token: string
  user: any
  loading: boolean

  login: (body: any) => Promise<boolean>
  register: (body: any) => Promise<boolean>
  getUserData: () => any
  updateUserData: (userData: any) => void
  hasPermission: (subject: string, action: string) => boolean
  refreshPermissions: () => Promise<boolean>

  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, _get) => ({
      token: '',
      user: null,
      loading: false,

      login: async (body: any) => {
        const response: any = await Network.post(Urls.login, {
          ...body
        })

        if (!response.ok) {
          showErrorMessage(response.data.message)

          return false
        }
        const { token, user } = response.data.data

        // Check if user is active
        if (user && user.isActive === false) {
          showErrorMessage('User account is inactive. Please contact your administrator.')
          return false
        }

        set({ token, user })

        return true
      },

      getUserData: async () => {
        const response: any = await Network.get(Urls.me)

        if (!response.ok) {
          showErrorMessage(response.data.message)

          return false
        }
        const { user } = response.data.data

        // Check if user is active
        if (user && user.isActive === false) {
          showErrorMessage('User account is inactive. Please contact your administrator.')
          // Clear the stored user data and token
          set({ token: '', user: null })
          localStorage.removeItem('pfc-auth')
          return false
        }

        set({ user })
        return true
      },

      updateUserData: (userData: any) => {
        set({ user: userData })
      },

      hasPermission: (subject: string, action: string) => {
        const state = _get()
        const user = state.user

        if (!user) return false

        // Check if user has full permissions
        if (user.has_full_permission) return true

        // Check if user role has super admin privileges
        if (user.role?.isSuperAdmin) return true

        // Check specific permissions in user.permissions array (format: "subject:action")
        const permission = `${subject}:${action}`
        if (user.permissions?.includes(permission)) return true

        // Fallback: Check grouped permissions in role.permissions object
        if (user.role?.permissions && user.role.permissions[subject]) {
          return user.role.permissions[subject][action] === true
        }

        return false
      },

      refreshPermissions: async () => {
        const response: any = await Network.get(Urls.me)

        if (!response.ok) {
          showErrorMessage(response.data.message)
          return false
        }

        const { user } = response.data.data

        // Check if user is active
        if (user && user.isActive === false) {
          showErrorMessage('User account is inactive. Please contact your administrator.')
          // Clear the stored user data and token
          set({ token: '', user: null })
          localStorage.removeItem('pfc-auth')
          return false
        }

        set({ user })
        return true
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      register: async (_body: any) => {
        return true
      },
      logout: () => {
        set({ token: '', user: null })
        // Clear localStorage manually to ensure complete cleanup
        localStorage.removeItem('pfc-auth')
      }
    }),
    {
      name: 'pfc-auth',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useAuthStore
