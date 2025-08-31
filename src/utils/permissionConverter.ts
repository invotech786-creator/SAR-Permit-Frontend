/**
 * Convert old permission format to new format
 * Converts "read" to "view" for backward compatibility
 */
export const convertPermissionsFormat = (permissions: any): any => {
  if (!permissions || typeof permissions !== 'object') {
    return permissions
  }

  const convertedPermissions: any = {}

  Object.keys(permissions).forEach(resource => {
    const actions = permissions[resource]
    if (typeof actions === 'object' && actions !== null) {
      convertedPermissions[resource] = { ...actions }
      
      // Convert "read" to "view" if it exists
      if ('read' in actions) {
        convertedPermissions[resource].view = actions.read
        delete convertedPermissions[resource].read
      }
    } else {
      convertedPermissions[resource] = actions
    }
  })

  return convertedPermissions
}

/**
 * Convert new permission format back to old format for API compatibility
 * Converts "view" to "read" if the backend still expects old format
 */
export const convertPermissionsToBackendFormat = (permissions: any): any => {
  if (!permissions || typeof permissions !== 'object') {
    return permissions
  }

  const convertedPermissions: any = {}

  Object.keys(permissions).forEach(resource => {
    const actions = permissions[resource]
    if (typeof actions === 'object' && actions !== null) {
      convertedPermissions[resource] = { ...actions }
      
      // Keep "view" as is since backend now supports it
      // No conversion needed - backend handles both formats
    } else {
      convertedPermissions[resource] = actions
    }
  })

  return convertedPermissions
}

/**
 * Check if a permission exists, handling both old and new formats
 */
export const hasPermissionInFormat = (permissions: any, resource: string, action: string): boolean => {
  if (!permissions || !permissions[resource]) {
    return false
  }

  const resourcePermissions = permissions[resource]
  
  // Check for the requested action first
  if (resourcePermissions[action] === true) {
    return true
  }

  // If looking for "view", also check for "read" (backward compatibility)
  if (action === 'view' && resourcePermissions['read'] === true) {
    return true
  }

  // If looking for "read", also check for "view" (forward compatibility)
  if (action === 'read' && resourcePermissions['view'] === true) {
    return true
  }

  return false
}