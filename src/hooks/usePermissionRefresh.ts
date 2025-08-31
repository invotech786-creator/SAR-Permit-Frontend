import { useState } from 'react'
import useAuthStore from 'src/store/useAuthStore'
import { toast } from 'react-hot-toast'

/**
 * Hook to refresh user permissions without logout/login
 */
export const usePermissionRefresh = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { refreshPermissions } = useAuthStore()

  const refresh = async () => {
    setRefreshing(true)
    try {
      const success = await refreshPermissions()
      if (success) {
        toast.success('Permissions updated successfully')
      }
      return success
    } catch (error) {
      console.error('Error refreshing permissions:', error)
      toast.error('Failed to refresh permissions')
      return false
    } finally {
      setRefreshing(false)
    }
  }

  return {
    refresh,
    refreshing
  }
}

export default usePermissionRefresh