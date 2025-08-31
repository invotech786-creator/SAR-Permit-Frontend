export { default as useAuthStore } from './useAuthStore'
export { default as useUserStore } from './useUserStore'
export { default as useJobTitleStore } from './useJobTitleStore'
export { default as useCompanyStore } from './useCompanyStore'
export { default as useRoleStore } from './useRoleStore'
export { default as useLocationStore } from './useLocationStore'
export { default as useDepartmentStore } from './useDepartmentStore'
export { default as useRevisionStore } from './useRevisionStore'

// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'

export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    invoice,
    calendar,
    permissions
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
