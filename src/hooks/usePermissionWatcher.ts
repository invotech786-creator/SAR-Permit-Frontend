import { useEffect, useCallback, useRef } from 'react'
import useAuthStore from 'src/store/useAuthStore'

interface UsePermissionWatcherOptions {
  /**
   * Enable automatic polling for permission changes
   * @default true
   */
  enablePolling?: boolean
  
  /**
   * Polling interval in milliseconds
   * @default 5000 (5 seconds)
   */
  pollingInterval?: number
  
  /**
   * Enable permission refresh on window focus
   * @default true
   */
  refreshOnFocus?: boolean
}

/**
 * Hook to watch and automatically refresh permissions
 */
export const usePermissionWatcher = (options: UsePermissionWatcherOptions = {}) => {
  const {
    enablePolling = true,
    pollingInterval = 5000, // 5 seconds
    refreshOnFocus = true
  } = options

  const { refreshPermissions, user } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle window focus refresh
  useEffect(() => {
    if (!refreshOnFocus || !user) return

    const handleFocus = () => {
      refreshPermissions()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshOnFocus, refreshPermissions, user])

  // Handle automatic polling
  useEffect(() => {
    if (!user || !enablePolling) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      refreshPermissions()
    }, pollingInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enablePolling, pollingInterval, refreshPermissions, user])

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    return await refreshPermissions()
  }, [refreshPermissions])

  return {
    manualRefresh,
    user
  }
}

export default usePermissionWatcher