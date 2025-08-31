import { useEffect, useRef } from 'react'
import useAuthStore from 'src/store/useAuthStore'
import { toast } from 'react-hot-toast'

/**
 * Hook to detect permission changes and notify users
 */
export const usePermissionChangeDetector = () => {
  const { user } = useAuthStore()
  const previousPermissionsRef = useRef<string[]>([])
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!user?.permissions) return

    const currentPermissions = [...(user.permissions || [])].sort()
    const previousPermissions = previousPermissionsRef.current

    // Skip the initial load
    if (!isInitializedRef.current) {
      previousPermissionsRef.current = currentPermissions
      isInitializedRef.current = true
      return
    }

    // Compare permissions
    if (JSON.stringify(currentPermissions) !== JSON.stringify(previousPermissions)) {
      // Find added permissions
      const addedPermissions = currentPermissions.filter(
        perm => !previousPermissions.includes(perm)
      )

      // Find removed permissions
      const removedPermissions = previousPermissions.filter(
        perm => !currentPermissions.includes(perm)
      )

      // Notify user of changes
      if (addedPermissions.length > 0) {
        toast.success(`New permissions granted: ${addedPermissions.length} permission(s)`, {
          duration: 4000,
        })
      }

      if (removedPermissions.length > 0) {
        toast.error(`Permissions revoked: ${removedPermissions.length} permission(s)`, {
          duration: 4000,
        })
      }

      if (addedPermissions.length === 0 && removedPermissions.length === 0) {
        toast.info('Your permissions have been updated', {
          duration: 3000,
        })
      }

      // Update the reference
      previousPermissionsRef.current = currentPermissions
    }
  }, [user?.permissions])
}

export default usePermissionChangeDetector