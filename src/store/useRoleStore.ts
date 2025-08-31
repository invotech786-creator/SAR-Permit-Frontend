import { create } from 'zustand'
import { api } from 'src/api-config'
import { IRole } from 'src/types/role'
import { showErrorMessage, showSuccessMessage } from '../components'
import usePermissionStore from './usePermissionStore'

interface RoleState {
  roles: IRole[]
  loading: boolean
  error: string | null
  pagination: {
    current: number
    pages: number
    total: number
  }
  getRoles: (params?: any) => Promise<boolean>
  getRoleById: (id: string) => Promise<IRole | null>
  addRole: (role: Partial<IRole>) => Promise<boolean>
  updateRole: (id: string, role: Partial<IRole>) => Promise<boolean>
  deleteRole: (id: string) => Promise<boolean>
  bulkDeleteRoles: (roleIds: string[]) => Promise<boolean>
  bulkToggleRoles: (roleIds: string[], isActive: boolean) => Promise<boolean>
  assignUsersToRole: (roleId: string, userIds: string[]) => Promise<boolean>
  removeUsersFromRole: (roleId: string, userIds: string[]) => Promise<boolean>
  getUsersByRole: (roleId: string) => Promise<any[]>
  
  // New permission-based methods
  convertRolePermissionsToIds: (role: IRole) => string[]
}

const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },

  getRoles: async (params = {}) => {
    try {
      set({ loading: true, error: null })
      
      // Build query string manually to avoid nested parameter issue
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString()) 
      if (params.search) queryParams.append('search', params.search.toString())
      
      const queryString = queryParams.toString()
      const url = queryString ? `/roles?${queryString}` : '/roles'
      
      const response = await api.get(url)
      const data = response.data as any
      set({
        roles: data.data.roles || [],
        pagination: {
          current: data.data.current || 1,
          pages: data.data.pages || 1,
          total: data.data.total || 0
        },
        loading: false
      })
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch roles'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  getRoleById: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await api.get(`/roles/${id}`)
      const data = response.data as any
      set({ loading: false })

      return data.data.role
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return null
    }
  },

  addRole: async (role: Partial<IRole>) => {
    try {
      set({ loading: true, error: null })
      
      // Validate required fields
      if (!role.nameEn || role.nameEn.trim().length < 2) {
        showErrorMessage('Role name (English) is required and must be at least 2 characters')
        set({ loading: false })
        return false
      }

      // Transform the role data to match backend expectations
      const roleData = {
        nameEn: role.nameEn.trim(),
        nameAr: role.nameAr?.trim() || role.nameEn.trim(),
        descriptionEn: role.descriptionEn?.trim() || `Role for ${role.nameEn.trim()}`,
        descriptionAr: role.descriptionAr?.trim() || '',
        permissions: role.permissions || [],
        has_full_permission: role.has_full_permission || false,
        isSuperAdmin: role.isSuperAdmin || false,
        isActive: role.isActive !== undefined ? role.isActive : true
      }

      const response = await api.post('/roles', roleData)
      await get().getRoles()
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Role added successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to add role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  updateRole: async (id: string, role: Partial<IRole>) => {
    try {
      set({ loading: true, error: null })
      
      // Validate required fields
      if (!role.nameEn || role.nameEn.trim().length < 2) {
        showErrorMessage('Role name (English) is required and must be at least 2 characters')
        set({ loading: false })
        return false
      }

      // Transform the role data to match backend expectations
      const roleData = {
        nameEn: role.nameEn.trim(),
        nameAr: role.nameAr?.trim() || role.nameEn.trim(),
        descriptionEn: role.descriptionEn?.trim() || `Role for ${role.nameEn.trim()}`,
        descriptionAr: role.descriptionAr?.trim() || '',
        permissions: role.permissions || [],
        has_full_permission: role.has_full_permission,
        isSuperAdmin: role.isSuperAdmin,
        isActive: role.isActive
      }

      const response = await api.put(`/roles/${id}`, roleData)
      await get().getRoles()
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Role updated successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to update role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  deleteRole: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const response = await api.delete(`/roles/${id}`)
      await get().getRoles()
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Role deleted successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to delete role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  bulkDeleteRoles: async (roleIds: string[]) => {
    try {
      set({ loading: true, error: null })
      const response = await api.post('/roles/bulk-delete', { ids: roleIds })
      await get().getRoles()
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Roles deleted successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to delete roles'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  bulkToggleRoles: async (roleIds: string[], isActive: boolean) => {
    try {
      set({ loading: true, error: null })
      const response = await api.post('/roles/bulk-toggle', { ids: roleIds, status: isActive })
      await get().getRoles()
      set({ loading: false })
      const status = isActive ? 'activated' : 'deactivated'
      showSuccessMessage((response.data as any).message || `Roles ${status} successfully`)
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to update roles'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  assignUsersToRole: async (roleId: string, userIds: string[]) => {
    try {
      set({ loading: true, error: null })
      const response = await api.post(`/roles/${roleId}/assign-users`, { userIds })
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Users assigned to role successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to assign users to role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  removeUsersFromRole: async (roleId: string, userIds: string[]) => {
    try {
      set({ loading: true, error: null })
      const response = await api.delete(`/roles/${roleId}/assign-users`, { data: { userIds } })
      set({ loading: false })
      showSuccessMessage((response.data as any).message || 'Users removed from role successfully')
      return true
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to remove users from role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return false
    }
  },

  getUsersByRole: async (roleId: string) => {
    try {
      set({ loading: true, error: null })
      const response = await api.get(`/roles/${roleId}/users`)
      const data = response.data as any
      set({ loading: false })

      return data.data.users || []
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch users by role'
      set({
        error: errorMessage,
        loading: false
      })
      showErrorMessage(errorMessage)
      return []
    }
  },

  // New permission-based methods
  convertRolePermissionsToIds: (role: IRole) => {
    // Return the permissions array directly (it should already be IDs)
    return role.permissions || []
  }
}))

export default useRoleStore
