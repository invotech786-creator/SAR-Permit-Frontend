// ** React Imports
import { ReactNode, useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Types
import type { ACLObj, AppAbility } from 'src/configs/acl'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Config Import
import { buildAbilityFor } from 'src/configs/acl'

// ** Component Import
import NotAuthorized from 'src/pages/401'
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useAuthStore } from 'src/store'

interface AclGuardProps {
  children: ReactNode
  guestGuard: boolean
  aclAbilities: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  // ** Props
  const { aclAbilities, children, guestGuard } = props

  const [ability, setAbility] = useState<AppAbility | undefined>(undefined)

  // ** Hooks
  const auth = useAuthStore()
  const router = useRouter()

  // User is logged in, build ability for the user based on his permissions
  // This effect will rebuild the ability whenever user permissions change
  useEffect(() => {
    if (auth.user) {
      const newAbility = buildAbilityFor(auth.user, aclAbilities.subject)
      setAbility(newAbility)
    } else {
      setAbility(undefined)
    }
  }, [auth.user, auth.user?.permissions, auth.user?.role?.permissions, auth.user?.has_full_permission, aclAbilities.subject])

  // If guestGuard is true and user is not logged in or its an error page, render the page without checking access
  if (guestGuard || router.route === '/404' || router.route === '/500' || router.route === '/') {
    return <>{children}</>
  }

  // Always provide AbilityContext, but check access for page content
  if (ability) {
    if (ability.can(aclAbilities.action, aclAbilities.subject)) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    } else {
      // Provide context for navigation but render content anyway (no 401 page)
      return (
        <AbilityContext.Provider value={ability}>
          {children}
        </AbilityContext.Provider>
      )
    }
  }

  // No ability available, render children without context (shouldn't happen with logged-in users)
  return <>{children}</>
}

export default AclGuard
