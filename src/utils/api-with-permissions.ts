import { Network } from 'src/api-config'
import { hasApiPermission, PermissionDeniedError, API_PERMISSIONS } from './permissions'

/**
 * Safe API wrapper that checks permissions before making requests
 */
export class SafeApiClient {
  
  /**
   * Make a GET request with permission check
   */
  static async get(url: string, header?: any, data?: any) {
    if (!hasApiPermission('GET', url)) {
      const permissionKey = `GET ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError('GET', url, requiredPermission || 'Unknown')
    }
    
    return Network.get(url, header, data)
  }

  /**
   * Make a POST request with permission check
   */
  static async post(url: string, data: any = {}, header?: any) {
    if (!hasApiPermission('POST', url)) {
      const permissionKey = `POST ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError('POST', url, requiredPermission || 'Unknown')
    }
    
    return Network.post(url, data, header)
  }

  /**
   * Make a PUT request with permission check
   */
  static async put(url: string, data: any = {}, header?: any) {
    if (!hasApiPermission('PUT', url)) {
      const permissionKey = `PUT ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError('PUT', url, requiredPermission || 'Unknown')
    }
    
    return Network.put(url, data, header)
  }

  /**
   * Make a PATCH request with permission check
   */
  static async patch(url: string, data: any = {}, header?: any) {
    if (!hasApiPermission('PATCH', url)) {
      const permissionKey = `PATCH ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError('PATCH', url, requiredPermission || 'Unknown')
    }
    
    return Network.patch(url, data, header)
  }

  /**
   * Make a DELETE request with permission check
   */
  static async delete(url: string, data?: any, header?: any) {
    if (!hasApiPermission('DELETE', url)) {
      const permissionKey = `DELETE ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError('DELETE', url, requiredPermission || 'Unknown')
    }
    
    return Network.delete(url, data, header)
  }
}

/**
 * Hook for components to use safe API calls
 */
export const useSafeApi = () => {
  const handlePermissionError = (error: any) => {
    if (error instanceof PermissionDeniedError) {
      console.error('🚫 Permission denied:', error.message)
      // You can show a toast notification here
      return { ok: false, data: { message: error.message } }
    }
    throw error
  }

  return {
    get: async (url: string, header?: any, data?: any) => {
      try {
        return await SafeApiClient.get(url, header, data)
      } catch (error) {
        return handlePermissionError(error)
      }
    },
    post: async (url: string, data: any = {}, header?: any) => {
      try {
        return await SafeApiClient.post(url, data, header)
      } catch (error) {
        return handlePermissionError(error)
      }
    },
    put: async (url: string, data: any = {}, header?: any) => {
      try {
        return await SafeApiClient.put(url, data, header)
      } catch (error) {
        return handlePermissionError(error)
      }
    },
    patch: async (url: string, data: any = {}, header?: any) => {
      try {
        return await SafeApiClient.patch(url, data, header)
      } catch (error) {
        return handlePermissionError(error)
      }
    },
    delete: async (url: string, data?: any, header?: any) => {
      try {
        return await SafeApiClient.delete(url, data, header)
      } catch (error) {
        return handlePermissionError(error)
      }
    },
    
    // Convenience methods for checking permissions
    canGet: (url: string) => hasApiPermission('GET', url),
    canPost: (url: string) => hasApiPermission('POST', url),
    canPut: (url: string) => hasApiPermission('PUT', url),
    canPatch: (url: string) => hasApiPermission('PATCH', url),
    canDelete: (url: string) => hasApiPermission('DELETE', url),
  }
}

/**
 * Higher-order component to wrap API calls with permission checks
 */
export const withPermissionCheck = <T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  method: string,
  url: string
): T => {
  return (async (...args: any[]) => {
    if (!hasApiPermission(method, url)) {
      const permissionKey = `${method.toUpperCase()} ${url}` as keyof typeof API_PERMISSIONS
      const requiredPermission = API_PERMISSIONS[permissionKey]
      throw new PermissionDeniedError(method, url, requiredPermission || 'Unknown')
    }
    
    return apiCall(...args)
  }) as T
}

// Export the original Network client for backward compatibility
export { Network as UnsafeNetwork }