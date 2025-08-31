import { IUser } from 'src/types'
import useAuthStore from 'src/store/useAuthStore'

export interface Permission {
  action: 'view' | 'create' | 'update' | 'delete' | 'import' | 'export' | 'history' | 'update-participant' | 'bulk-delete'
  subject: string
}

export interface RolePermissions {
  [category: string]: {
    view?: boolean
    create?: boolean
    update?: boolean
    delete?: boolean
    import?: boolean
    export?: boolean
    history?: boolean
    'update-participant'?: boolean
    'bulk-delete'?: boolean
  }
}

/**
 * Check if user has permission for a specific action and subject
 */
export const hasPermission = (user: IUser | null, action: string, subject: string): boolean => {
  if (!user) return false

  // Check if user has full permissions
  if (user.has_full_permission) return true

  // Check if user role has super admin privileges
  if (user.role?.has_full_permission || user.role?.isSuperAdmin) return true

  // Check specific permissions in user.permissions array (format: "subject:action")
  const permission = `${subject}:${action}`
  if (user.permissions?.includes(permission)) return true

  // Fallback: Check grouped permissions in role.permissions object
  if (user.role?.permissions && user.role.permissions[subject]) {
    return user.role.permissions[subject][action] === true
  }

  return false
}

/**
 * Check if user can access a specific module/page (view permission)
 */
export const canAccess = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'view', subject)
}

/**
 * Check if user can perform CRUD operations
 */
export const canCreate = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'create', subject)
}

export const canUpdate = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'update', subject)
}

export const canDelete = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'delete', subject)
}

export const canView = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'view', subject)
}

export const canImport = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'import', subject)
}

export const canExport = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'export', subject)
}

export const canViewHistory = (user: IUser | null, subject: string): boolean => {
  return hasPermission(user, 'history', subject)
}

export const canManage = (user: IUser | null, subject: string): boolean => {
  return user?.has_full_permission || user?.role?.has_full_permission || false
}

/**
 * Get user's permissions for a specific subject from grouped permissions
 */
export const getUserPermissions = (user: IUser | null, subject: string): RolePermissions[string] | null => {
  if (!user || !user.groupedPermissions) return null
  return user.groupedPermissions[subject] || null
}

/**
 * Check if user has any permission for a subject
 */
export const hasAnyPermission = (user: IUser | null, subject: string): boolean => {
  if (!user) return false

  if (user.has_full_permission || user.role?.has_full_permission) return true

  const userPermissions = getUserPermissions(user, subject)
  if (!userPermissions) return false

  return Object.values(userPermissions).some(Boolean)
}

/**
 * Get all subjects that user has access to
 */
export const getUserAccessibleSubjects = (user: IUser | null): string[] => {
  if (!user) return []

  if (user.has_full_permission || user.role?.has_full_permission) {
    return [
      'user-management',
      'role-management',
      'company-management',
      'job-title-management',
    ]
  }

  if (!user.groupedPermissions) return []

  return Object.keys(user.groupedPermissions).filter(subject =>
    hasAnyPermission(user, subject)
  )
}

/**
 * Hook to use auth store's hasPermission method
 */
export const usePermission = () => {
  const { hasPermission: checkPermission, user } = useAuthStore()

  return {
    hasPermission: checkPermission,
    user,
    canAccess: (subject: string) => checkPermission(subject, 'view'),
    canCreate: (subject: string) => checkPermission(subject, 'create'),
    canUpdate: (subject: string) => checkPermission(subject, 'update'),
    canDelete: (subject: string) => checkPermission(subject, 'delete'),
    canImport: (subject: string) => checkPermission(subject, 'import'),
    canExport: (subject: string) => checkPermission(subject, 'export'),
    canViewHistory: (subject: string) => checkPermission(subject, 'history'),
    canManage: () => user?.has_full_permission || user?.role?.has_full_permission || false
  }
}

/**
 * Get current user from auth store
 */
export const getCurrentUser = () => {
  return useAuthStore.getState().user
}

/**
 * Check if current user has specific permission
 */
export const checkCurrentUserPermission = (subject: string, action: string): boolean => {
  return useAuthStore.getState().hasPermission(subject, action)
}

/**
 * API permission mappings - maps API endpoints to required permissions
 */
export const API_PERMISSIONS = {
  // Users
  'GET /users': 'user-management:view',
  'GET users': 'user-management:view',
  'POST /users': 'user-management:create',
  'POST users': 'user-management:create',
  'PUT /users': 'user-management:update',
  'PUT users': 'user-management:update',
  'PATCH /users': 'user-management:update',
  'PATCH users': 'user-management:update',
  'DELETE /users': 'user-management:delete',
  'DELETE users': 'user-management:delete',

  // Roles
  'GET /roles': 'role-management:view',
  'GET roles': 'role-management:view',
  'POST /roles': 'role-management:create',
  'POST roles': 'role-management:create',
  'PUT /roles': 'role-management:update',
  'PUT roles': 'role-management:update',
  'PATCH /roles': 'role-management:update',
  'PATCH roles': 'role-management:update',
  'DELETE /roles': 'role-management:delete',
  'DELETE roles': 'role-management:delete',

  // Companies
  'GET /companies': 'company-management:view',
  'GET companies': 'company-management:view',
  'POST /companies': 'company-management:create',
  'POST companies': 'company-management:create',
  'PUT /companies': 'company-management:update',
  'PUT companies': 'company-management:update',
  'PATCH /companies': 'company-management:update',
  'PATCH companies': 'company-management:update',
  'DELETE /companies': 'company-management:delete',
  'DELETE companies': 'company-management:delete',


  // Job Titles
  'GET /job-titles': 'job-title-management:view',
  'POST /job-titles': 'job-title-management:create',
  'PUT /job-titles': 'job-title-management:update',
  'PATCH /job-titles': 'job-title-management:update',
  'DELETE /job-titles': 'job-title-management:delete',

  // Permits
  'GET /permits': 'permit-management:view',
  'POST /permits': 'permit-management:create',
  'PUT /permits': 'permit-management:update',
  'PATCH /permits': 'permit-management:update',
  'DELETE /permits': 'permit-management:delete',

  // History endpoints for core modules
  'GET /users/history': 'user-management:history',
  'GET /companies/history': 'company-management:history',
  'GET /job-titles/history': 'job-title-management:history',
  'GET /permits/history': 'permit-management:history',
  'GET /roles/history': 'role-management:history',
  
  // Revision models endpoints for history
  'GET /revision-models': 'user-management:history',
  'GET /revision-models/User': 'user-management:history',
  'GET /revision-models/Company': 'company-management:history',
  'GET /revision-models/JobTitle': 'job-title-management:history',
  'GET /revision-models/Permit': 'permit-management:history',
  'GET /revision-models/Role': 'role-management:history',
  
  // Alternative history endpoints patterns
  'GET /history/users': 'user-management:history',
  'GET /history/companies': 'company-management:history',
  'GET /history/job-titles': 'job-title-management:history',
  'GET /history/permits': 'permit-management:history',
  'GET /history/roles': 'role-management:history',

} as const

/**
 * Extract the API path from a URL (removes base URL and query params)
 */
const extractApiPath = (url: string): string => {
  try {
    if (url.startsWith('/')) {
      return url.split('?')[0]
    }

    const urlObj = new URL(url)
    return urlObj.pathname.split('?')[0]
  } catch {
    return url.startsWith('/') ? url.split('?')[0] : `/${url.split('?')[0]}`
  }
}

/**
 * Normalize API path to remove dynamic IDs and extract base resource
 */
const normalizeApiPath = (path: string): string => {
  const mongoIdPattern = /\/[0-9a-fA-F]{24}/g
  let normalized = path.replace(mongoIdPattern, '')

  normalized = normalized.replace(/\/$/, '')

  // Handle revision-models specific paths
  if (normalized.includes('revision-models')) {
    // Pattern: revision-models/EntityType/history/entity or revision-models/EntityType
    const revisionMatch = normalized.match(/revision-models\/([^\/]+)/)
    if (revisionMatch) {
      const entityType = revisionMatch[1]
      return `/revision-models/${entityType}`
    }
    return '/revision-models'
  }

  if (!normalized || normalized === '') {
    const parts = path.split('/')
    const resourcePart = parts.find(part => part && !/^[0-9a-fA-F]{24}$/.test(part))
    return resourcePart ? `/${resourcePart}` : path
  }

  return normalized
}

/**
 * Check if user has permission for a specific API call
 */
export const hasApiPermission = (method: string, url: string): boolean => {
  const user = getCurrentUser()

  if (user?.has_full_permission || user?.role?.isSuperAdmin || user?.role?.has_full_permission) {
    return true
  }

  const apiPath = extractApiPath(url)
  const normalizedPath = normalizeApiPath(apiPath)

  let key = `${method.toUpperCase()} ${normalizedPath}` as keyof typeof API_PERMISSIONS
  let permission = API_PERMISSIONS[key]

  if (!permission && normalizedPath.startsWith('/')) {
    key = `${method.toUpperCase()} ${normalizedPath.substring(1)}` as keyof typeof API_PERMISSIONS
    permission = API_PERMISSIONS[key]
  }

  if (!permission && !normalizedPath.startsWith('/')) {
    key = `${method.toUpperCase()} /${normalizedPath}` as keyof typeof API_PERMISSIONS
    permission = API_PERMISSIONS[key]
  }

  if (!permission) {
    const allowedPaths = ['/auth', 'auth', '/me', 'me', '/login', 'login']
    const isAllowed = allowedPaths.some(path =>
      normalizedPath.includes(path) || normalizedPath.endsWith(path)
    )

    if (isAllowed) {
      return true
    }
    return false
  }

  const [subject, action] = permission.split(':')
  const hasPermission = checkCurrentUserPermission(subject, action)
  return hasPermission
}

/**
 * Error class for permission denied
 */
export class PermissionDeniedError extends Error {
  constructor(method: string, url: string, requiredPermission: string) {
    super(`Permission denied for ${method} ${url}. Required: ${requiredPermission}`)
    this.name = 'PermissionDeniedError'
  }
}
