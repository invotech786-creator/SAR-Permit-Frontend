import { ReactNode, useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { NavLink } from 'src/@core/layouts/types'
import useAuthStore from 'src/store/useAuthStore'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  const { children, navLink } = props
  const ability = useContext(AbilityContext)
  const { user } = useAuthStore() // Force re-render when user changes

  if (!navLink?.action || !navLink?.subject) {
    return <>{children}</>
  }

  const canView = ability && ability.can(navLink.action, navLink.subject)
  return canView ? <>{children}</> : null
}

export default CanViewNavLink
