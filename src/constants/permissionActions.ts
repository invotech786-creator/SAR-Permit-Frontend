// Permission actions available for each resource category
export const PERMISSION_ACTIONS: { [category: string]: string[] } = {
  'user-management': ['view', 'create', 'update', 'delete', 'bulk-delete', 'toggle-activity', 'history'],
  'company-management': ['view', 'create', 'update', 'delete', 'bulk-delete', 'toggle-activity', 'history'],
  'job-title-management': ['view', 'create', 'update', 'delete', 'bulk-delete', 'toggle-activity', 'history'],
  'role-management': [
    'view',
    'create',
    'update',
    'delete',
    'bulk-delete',
    'toggle-activity',
    'get-permissions',
    'get-users',
    'history'
  ],
  'permit-management': ['view', 'create', 'update', 'delete', 'approve', 'reject', 'history'],
}

// Common actions that most resources have
export const COMMON_ACTIONS = ['view', 'create', 'update', 'delete']

// Action display names for UI
export const ACTION_LABELS: { [action: string]: string } = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  'bulk-delete': 'Bulk Delete',
  'toggle-activity': 'Toggle Status',
  'get-permissions': 'Get Permissions',
  'get-users': 'Get Users',
  'update-participant': 'Update Participant',
  import: 'Import',
  export: 'Export',
  history: 'History',
  'create-folder': 'Create Folder',
  upload: 'Upload',
  download: 'Download',
  'update-status': 'Update Status',
  timetable: 'Timetable',
  data: 'Data',
  approve: 'Approve',
  reject: 'Reject'
}

// Get actions for a specific resource
export const getActionsForResource = (resource: string): string[] => {
  return PERMISSION_ACTIONS[resource] || COMMON_ACTIONS
}

// Check if an action is available for a resource
export const isActionAvailable = (resource: string, action: string): boolean => {
  return getActionsForResource(resource).includes(action)
}
