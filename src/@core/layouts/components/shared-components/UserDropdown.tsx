// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import { useAuthStore } from 'src/store'
import { usePermissionRefresh } from 'src/hooks/usePermissionRefresh'

// ** Translation Import
import { useTranslation } from 'react-i18next'

interface Props {
  settings: Settings
}

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const { refresh, refreshing } = usePermissionRefresh()
  const { t } = useTranslation()

  // ** Vars
  const { direction } = settings

  // ** Helper function to get user initials
  const getUserInitials = (user: any) => {
    if (!user) return 'U'

    const nameEn = user.nameEn || ''
    const nameAr = user.nameAr || ''
    const username = user.username || ''

    // Try to get initials from English name first, then Arabic name, then username
    const name = nameEn || nameAr || username

    if (name) {
      return name
        .split(' ')
        .map((word: string) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return 'U'
  }

  // ** Helper function to get user display name
  const getUserDisplayName = (user: any) => {
    if (!user) return 'User'

    return user.nameEn || user.nameAr || user.username || 'User'
  }

  // ** Helper function to get user role

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      color: 'text.primary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
    router.push('/login')
  }

  const handleRefreshPermissions = async () => {
    await refresh()
    handleDropdownClose()
  }

  const userDisplayName = getUserDisplayName(user)
  const userInitials = getUserInitials(user)

  return (
    <Fragment>
      <Avatar
        alt={userDisplayName}
        src={user?.profilePic}
        onClick={handleDropdownOpen}
        sx={{
          width: 40,
          height: 40,
          ml: 2,
          cursor: 'pointer',
          backgroundColor: 'primary.main',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: 600
        }}
      >
        {!user?.profilePic && userInitials}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 280, mt: 4.5 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt={userDisplayName}
              src={user?.profilePic}
              sx={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {!user?.profilePic && userInitials}
            </Avatar>
            <Box
              sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column', minWidth: 0, flex: 1 }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }} noWrap>
                {userDisplayName}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  lineHeight: 1.2
                }}
              >
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/profile')}>
          <Box sx={styles}>
            <Icon icon='tabler:user-check' />
            {t('My Profile')}
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={handleRefreshPermissions} disabled={refreshing}>
          <Box sx={styles}>
            <Icon
              icon={refreshing ? 'tabler:loader-2' : 'tabler:refresh'}
              className={refreshing ? 'animate-spin' : ''}
            />
            {t('Refresh Permissions')}
          </Box>
        </MenuItemStyled>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled onClick={handleLogout} sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem' } }}>
          <Icon icon='tabler:logout' />
          {t('Logout')}
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
