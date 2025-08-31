// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Hook Imports
import { useAuthStore } from 'src/store'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={
          <Typography variant='h4'>
            {t('Welcome back')}, {user?.name || 'User'}! 👋
          </Typography>
        }
        subtitle={
          <Typography sx={{ color: 'text.secondary' }}>
            {t('Manage your system efficiently with role-based access controls')}
          </Typography>
        }
      />

      <Grid item xs={12}>
        <Card>
          <CardHeader title={t('System Overview')} />
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {t('Available Modules')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('My Profile')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage personal information')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Users')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage user accounts and profiles')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Roles & Permissions')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Configure access controls')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Job Titles')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage job positions and titles')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Departments')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage department structure')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Permit System')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage permit applications')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant='h6'>{t('Companies')}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t('Manage company information')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Home
