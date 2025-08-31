import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from 'src/api-config'

export interface Permission {
  id: string
  name: string
  nameAr?: string
}

export interface PermissionGroup {
  permissions: Permission[]
  moduleDescriptions: string
  moduleInfo?: {
    name: string
    nameAr: string
    description: string
    descriptionAr: string
  }
}

export interface StructuredPermissions {
  [module: string]: PermissionGroup
}

export interface ModuleInfo {
  [module: string]: {
    name: string
    nameAr: string
    description: string
    descriptionAr: string
  }
}


interface PermissionState {
  permissions: Permission[]
  structuredPermissions: StructuredPermissions
  modules: string[]
  moduleInfo: ModuleInfo
  loading: boolean
  error: string | null

  // Actions
  fetchPermissions: () => Promise<boolean>
  getPermissionById: (id: string) => Permission | undefined
  getPermissionsByModule: (module: string) => Permission[]
  getAllPermissionIds: () => string[]
  getDisplayName: (permission: Permission, language?: string) => string
  getModuleDisplayName: (module: string, language?: string) => string
  getModuleDescription: (module: string, language?: string) => string
}

const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: [],
      structuredPermissions: {},
      modules: [],
      moduleInfo: {},
      loading: false,
      error: null,

      fetchPermissions: async () => {
        set({ loading: true, error: null })
        try {
          const response = await api.get('/permissions/groups')
          
          if (response.ok && (response.data as any)?.success) {
            const structuredPermissions = (response.data as any).data
            const modules = Object.keys(structuredPermissions)
            const permissions: Permission[] = []
            const moduleInfo: ModuleInfo = {}
            
            // Extract all permissions and build moduleInfo
            modules.forEach(module => {
              const group = structuredPermissions[module]
              permissions.push(...group.permissions)
              
              // Use moduleInfo from backend if available, otherwise generate
              const info = group.moduleInfo || {
                name: module.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                nameAr: module,
                description: group.moduleDescriptions,
                descriptionAr: group.moduleDescriptions
              }
              
              moduleInfo[module] = {
                name: info.name,
                nameAr: info.nameAr,
                description: info.description,
                descriptionAr: info.descriptionAr
              }
            })
            
            set({
              permissions,
              structuredPermissions,
              modules,
              moduleInfo,
              loading: false,
              error: null
            })
            return true
          } else {
            set({ 
              error: (response.data as any)?.message || 'Failed to fetch permissions',
              loading: false 
            })
            return false
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch permissions',
            loading: false 
          })
          return false
        }
      },


      getPermissionById: (id: string) => {
        const state = get()
        return state.permissions.find(perm => perm.id === id)
      },


      getPermissionsByModule: (module: string) => {
        const state = get()
        return state.structuredPermissions[module]?.permissions || []
      },




      getAllPermissionIds: () => {
        const state = get()
        return state.permissions.map(perm => perm.id)
      },

      getDisplayName: (permission: Permission, language?: string) => {
        return language === 'ar' && permission.nameAr ? permission.nameAr : permission.name
      },

      getModuleDisplayName: (module: string, language?: string) => {
        const state = get()
        const moduleInfo = state.moduleInfo[module]
        if (!moduleInfo) return module
        return language === 'ar' && moduleInfo.nameAr ? moduleInfo.nameAr : moduleInfo.name
      },

      getModuleDescription: (module: string, language?: string) => {
        const state = get()
        const moduleInfo = state.moduleInfo[module]
        if (!moduleInfo) return ''
        return language === 'ar' && moduleInfo.descriptionAr ? moduleInfo.descriptionAr : moduleInfo.description
      }
    }),
    {
      name: 'permission-store',
      partialize: (state) => ({
        permissions: state.permissions,
        structuredPermissions: state.structuredPermissions,
        modules: state.modules,
        moduleInfo: state.moduleInfo
      })
    }
  )
)

export default usePermissionStore