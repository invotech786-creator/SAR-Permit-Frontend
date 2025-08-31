import { useRouter } from 'next/router'
import { useEffect } from 'react'
import navigation from 'src/navigation/vertical'
import { checkCurrentUserPermission, getCurrentUser } from './permissions'

/**
 * Get the first accessible page for the current user
 */
export const getFirstAccessiblePage = (): string => {
  const user = getCurrentUser()
  const navItems = navigation()
  
  // Always allow access to home and profile
  const alwaysAccessiblePages = ['/home', '/profile']
  
  // Check each navigation item
  for (const item of navItems) {
    // If no permission requirements, it's accessible
    if (!item.action || !item.subject) {
      if (item.path && !alwaysAccessiblePages.includes(item.path)) {
        return item.path
      }
      continue
    }
    
    // Check if user has required permission
    if (checkCurrentUserPermission(item.subject, item.action)) {
      return item.path || '/home'
    }
  }
  
  // Fallback to home if no accessible pages found
  return '/home'
}

/**
 * Get all accessible pages for the current user
 */
export const getAccessiblePages = (): string[] => {
  const user = getCurrentUser()
  const navItems = navigation()
  const accessiblePages: string[] = []
  
  for (const item of navItems) {
    // If no permission requirements, it's accessible
    if (!item.action || !item.subject) {
      if (item.path) {
        accessiblePages.push(item.path)
      }
      continue
    }
    
    // Check if user has required permission
    if (checkCurrentUserPermission(item.subject, item.action)) {
      if (item.path) {
        accessiblePages.push(item.path)
      }
    }
  }
  
  return accessiblePages
}

/**
 * Hook to redirect to first accessible page if current page is not accessible
 */
export const useRedirectToAccessiblePage = () => {
  const router = useRouter()
  
  useEffect(() => {
    const currentPath = router.pathname
    const accessiblePages = getAccessiblePages()
    
    // Skip redirect for login page and other auth pages
    const authPages = ['/login', '/register', '/forgot-password', '/']
    if (authPages.includes(currentPath)) {
      return
    }
    
    // If current page is not in accessible pages, redirect to first accessible
    if (!accessiblePages.includes(currentPath)) {
      const firstAccessiblePage = getFirstAccessiblePage()
      console.log(`🔄 Redirecting from ${currentPath} to ${firstAccessiblePage} (first accessible page)`)
      router.replace(firstAccessiblePage)
    }
  }, [router])
}

/**
 * Check if user can access a specific path
 */
export const canAccessPath = (path: string): boolean => {
  const navItems = navigation()
  
  // Find the navigation item for this path
  const navItem = navItems.find(item => item.path === path)
  
  if (!navItem) {
    return false // Path not in navigation = not accessible
  }
  
  // If no permission requirements, it's accessible
  if (!navItem.action || !navItem.subject) {
    return true
  }
  
  // Check if user has required permission
  return checkCurrentUserPermission(navItem.subject, navItem.action)
}