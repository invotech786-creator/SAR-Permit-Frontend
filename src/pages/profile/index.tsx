import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Box, Grid, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useAuthStore } from 'src/store'
import { ProfileUpdateModal } from 'src/components'
import { IUser } from 'src/types/user'
import { useTranslation } from 'react-i18next'

// ** Helper function to safely convert value to string
const safeString = (value: any, t?: any): string => {
  if (value === null || value === undefined) {
    return t ? t('N/A') : 'N/A'
  }
  if (typeof value === 'object') {
    if (value.nameEn) {
      return String(value.nameEn)
    }
    if (value.nameAr) {
      return String(value.nameAr)
    }
    if (value.name) {
      return String(value.name)
    }
    if (value.username) {
      return String(value.username)
    }

    return t ? t('N/A') : 'N/A'
  }

  return String(value)
}

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

// ** Helper function to get user role with proper localization
const getUserRole = (user: any, t?: any, locale?: string) => {
  if (!user) return t ? t('User') : 'User'

  const isArabic = locale === 'ar'

  // Check if user has role object with nameEn/nameAr
  if (user.role && typeof user.role === 'object') {
    // Return appropriate language based on current locale
    if (isArabic) {
      return user.role.nameAr || user.role.nameEn || (t ? t('User') : 'User')
    } else {
      return user.role.nameEn || user.role.nameAr || (t ? t('User') : 'User')
    }
  }

  // Fallback: check if roleId is an object (for backward compatibility)
  if (user.roleId && typeof user.roleId === 'object') {
    if (isArabic) {
      return user.roleId.nameAr || user.roleId.nameEn || (t ? t('User') : 'User')
    } else {
      return user.roleId.nameEn || user.roleId.nameAr || (t ? t('User') : 'User')
    }
  }

  return t ? t('User') : 'User'
}

// ** Helper function to get user company with proper localization
const getUserCompany = (user: any, t?: any, locale?: string) => {
  if (!user) return t ? t('N/A') : 'N/A'

  const isArabic = locale === 'ar'

  if (user.company && typeof user.company === 'object') {
    if (isArabic) {
      return user.company.nameAr || user.company.nameEn || (t ? t('N/A') : 'N/A')
    } else {
      return user.company.nameEn || user.company.nameAr || (t ? t('N/A') : 'N/A')
    }
  }

  if (user.companyId && typeof user.companyId === 'object') {
    if (isArabic) {
      return user.companyId.nameAr || user.companyId.nameEn || (t ? t('N/A') : 'N/A')
    } else {
      return user.companyId.nameEn || user.companyId.nameAr || (t ? t('N/A') : 'N/A')
    }
  }

  return t ? t('N/A') : 'N/A'
}

const Profile = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()
  const [userData, setUserData] = useState<IUser | null>(null)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>{t('Loading...')}</Typography>
      </Box>
    )
  }

  const displayName =
    i18n.language === 'ar'
      ? safeString(userData.nameAr || userData.nameEn, t)
      : safeString(userData.nameEn || userData.nameAr, t)
  const displayEmail = safeString(userData.email, t)
  const displayUsername = safeString(userData.username, t)
  const displayPhone = safeString(userData.phone, t)
  const userRole = getUserRole(userData, t, i18n.language)
  const userInitials = getUserInitials(userData)

  // ** Helper function to format phone number display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone || phone === 'N/A') {
      return phone
    }

    // Ensure phone number always has + at the beginning
    let displayPhone = phone
    if (!displayPhone.startsWith('+')) {
      displayPhone = `+${displayPhone}`
    }

    return displayPhone
  }

  return (
    <Grid container spacing={6.5} dir={isRTL ? 'rtl' : 'ltr'}>
      <Grid item xs={12}>
        {/* Profile Header */}
        <Card sx={{ mb: 6 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #00778B 0%, #005a6b 100%)',
              height: { xs: 150, md: 250 }
            }}
          />
          <CardContent
            sx={{
              pt: 0,
              mt: -8,
              display: 'flex',
              alignItems: 'flex-end',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
            <Box
              sx={{
                width: 108,
                height: 108,
                border: '4px solid white',
                borderRadius: 1,
                mb: { xs: 4, md: 0 },
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 600
              }}
            >
              {userData.profilePic ? (
                <Box
                  component='img'
                  src={userData.profilePic}
                  alt={displayName}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                userInitials
              )}
            </Box>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                ml: { xs: 0, md: isRTL ? 0 : 6 },
                mr: { xs: 0, md: isRTL ? 6 : 0 },
                alignItems: 'flex-end',
                flexWrap: ['wrap', 'nowrap'],
                justifyContent: ['center', 'space-between']
              }}
            >
              <Box sx={{ mb: [6, 0], display: 'flex', flexDirection: 'column', alignItems: ['center', 'flex-start'] }}>
                <Typography variant='h6' sx={{ mb: 2.5 }}>
                  {displayName}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: ['center', 'flex-start']
                  }}
                >
                  <Box
                    sx={{
                      mr: isRTL ? 0 : 4,
                      ml: isRTL ? 4 : 0,
                      display: 'flex',
                      alignItems: 'center',
                      '& svg': { mr: isRTL ? 0 : 1.5, ml: isRTL ? 1.5 : 0, color: 'text.secondary' }
                    }}
                  >
                    <Icon fontSize='1.25rem' icon='tabler:briefcase' />
                    <Typography sx={{ color: 'text.secondary' }}>{userRole}</Typography>
                  </Box>
                  <Box
                    sx={{
                      mr: isRTL ? 0 : 4,
                      ml: isRTL ? 4 : 0,
                      display: 'flex',
                      alignItems: 'center',
                      '& svg': { mr: isRTL ? 0 : 1.5, ml: isRTL ? 1.5 : 0, color: 'text.secondary' }
                    }}
                  >
                    <Icon fontSize='1.25rem' icon='tabler:user' />
                    <Typography sx={{ color: 'text.secondary' }}>{displayUsername}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      '& svg': { mr: isRTL ? 0 : 1.5, ml: isRTL ? 1.5 : 0, color: 'text.secondary' }
                    }}
                  >
                    <Icon fontSize='1.25rem' icon='tabler:mail' />
                    <Typography sx={{ color: 'text.secondary' }}>{displayEmail}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant='contained'
                  startIcon={<Icon icon='tabler:edit' />}
                  onClick={() => setUpdateModalOpen(true)}
                  sx={{
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  {t('Update Profile')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Profile Content */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 6 }}>
              <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                {t('About')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:user' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Name')}:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{displayName}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:user' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Username')}:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{displayUsername}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:briefcase' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Role')}:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{userRole}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:building' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Company')}:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{getUserCompany(userData, t, i18n.language)}</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 6 }}>
              <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                {t('Contact')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:mail' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Email')}:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{displayEmail}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  '&:not(:last-of-type)': { mb: 3 },
                  '& svg': { color: 'text.secondary' }
                }}
              >
                <Icon fontSize='1.25rem' icon='tabler:phone' />
                <Typography sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}>{t('Phone')}:</Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    direction: 'ltr', // Force LTR for phone numbers to ensure + is at the start
                    textAlign: isRTL ? 'right' : 'left',
                    unicodeBidi: 'plaintext' // Ensure proper text direction handling
                  }}
                >
                  {formatPhoneDisplay(displayPhone)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Profile Update Modal */}
      <ProfileUpdateModal open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} user={userData} />
    </Grid>
  )
}

export default Profile

Profile.acl = {
  subject: 'profile',
  action: 'read'
}
