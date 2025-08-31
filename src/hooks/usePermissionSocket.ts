import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import useAuthStore from 'src/store/useAuthStore'
import { toast } from 'react-hot-toast'

let socket: Socket | null = null

export const usePermissionSocket = () => {
  const { user, refreshPermissions } = useAuthStore()

  useEffect(() => {
    if (!user?.id) return

    // Initialize socket connection
    if (!socket) {
      const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
      socket = io(serverUrl, {
        transports: ['websocket'],
        upgrade: true
      })

      socket.on('connect', () => {
        console.log('🔌 Socket connected for permission updates')
      })

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
      })
    }

    // Listen for permission updates for this user
    const handlePermissionUpdate = async (data: { userId: string; message: string }) => {
      console.log('🔄 Permission update received for user:', user.id, data)

      try {
        console.log('🔄 Calling refreshPermissions() - This will make /me API call')
        const success = await refreshPermissions()
        if (success) {
          console.log('✅ Permissions refreshed successfully and saved to localStorage')
          toast.success('Permissions updated', {
            duration: 3000,
            position: 'top-right'
          })
        } else {
          console.error('❌ Failed to refresh permissions')
          toast.error('Failed to refresh permissions')
        }
      } catch (error) {
        console.error('❌ Error refreshing permissions:', error)
        toast.error('Failed to refresh permissions')
      }
    }

    // Listen for role removal events
    const handleRoleRemoved = async (data: { userId: string; roleId: string; roleName: string; message: string }) => {
      console.log('🚫 Role removed for user:', user.id, data)

      try {
        console.log('🔄 Role removed - calling refreshPermissions() to update user data')
        const success = await refreshPermissions()
        if (success) {
          console.log('✅ User data refreshed after role removal')
          toast.error(`Your role "${data.roleName}" has been deactivated and removed from your account`, {
            duration: 5000,
            position: 'top-right'
          })
        } else {
          console.error('❌ Failed to refresh user data after role removal')
          toast.error('Your role has been removed but failed to refresh your account')
        }
      } catch (error) {
        console.error('❌ Error refreshing user data after role removal:', error)
        toast.error('Your role has been removed but failed to refresh your account')
      }
    }

    const permissionEventName = `user:${user.id}:permissions-updated`
    const roleRemovedEventName = `user:${user.id}:role-removed`
    
    socket.on(permissionEventName, handlePermissionUpdate)
    socket.on(roleRemovedEventName, handleRoleRemoved)

    // Cleanup function
    return () => {
      if (socket) {
        socket.off(permissionEventName, handlePermissionUpdate)
        socket.off(roleRemovedEventName, handleRoleRemoved)
      }
    }
  }, [user?.id, refreshPermissions])

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])
}

export default usePermissionSocket
