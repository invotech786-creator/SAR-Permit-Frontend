// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuthStore } from 'src/store'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuthStore()
  const router = useRouter()

  useEffect(
    () => {
      if (!router.isReady) {
        return
      }

      // Check if user is null or inactive
      if (auth.user === null || (auth.user && auth.user.isActive === false)) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route]
  )

  // Check if user is null, inactive, or still loading
  if (auth.loading || auth.user === null || (auth.user && auth.user.isActive === false)) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
