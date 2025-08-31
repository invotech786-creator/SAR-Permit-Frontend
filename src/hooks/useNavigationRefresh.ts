import { useEffect, useState } from 'react'
import useAuthStore from 'src/store/useAuthStore'

/**
 * Hook to force navigation re-render when permissions change
 * This ensures navbar items update immediately after permission changes
 */
export const useNavigationRefresh = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuthStore()

  useEffect(() => {
    // Increment refresh key when permissions change
    setRefreshKey(prev => prev + 1)
  }, [
    user?.permissions,
    user?.role?.permissions,
    user?.has_full_permission,
    user?.role?.has_full_permission,
    user?.role?.isSuperAdmin
  ])

  return refreshKey
}

export default useNavigationRefresh