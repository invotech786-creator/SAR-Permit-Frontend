import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import Icon from 'src/@core/components/icon'
import { Network, Urls } from 'src/api-config'
import { showErrorMessage, showSuccessMessage } from 'src/components'
import { useAuthStore } from 'src/store'
import { useRoleStore } from 'src/store'
import { useJobTitleStore } from 'src/store'
import { useCompanyStore } from 'src/store'
import { IUser } from 'src/types/user'
import { IRole } from 'src/types/role'
import { IJobTitle } from 'src/types/jobtitle'
import { ICompany } from 'src/types/company'

interface ProfileUpdateModalProps {
  open: boolean
  onClose: () => void
  user: IUser
}

interface UpdateProfileData {
  nameAr: string
  nameEn: string
  email: string
  phone: string
  roleId: string
  jobTitleId: string
  companyId: string
  username: string
  password?: string
  profilePic?: File
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({ open, onClose, user }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Use the same pattern as companies and job titles modules
  const getCurrentLocale = () => {
    return i18n?.language || 'en'
  }

  const locale = getCurrentLocale()
  const { updateUserData, refreshPermissions } = useAuthStore()
  const { roles, getRoles } = useRoleStore()
  const { jobTitles, getJobTitles } = useJobTitleStore()
  const { companies, getCompanies } = useCompanyStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileData>({
    nameAr: '',
    nameEn: '',
    email: '',
    phone: '',
    roleId: '',
    jobTitleId: '',
    companyId: '',
    username: '',
    password: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (open) {
      // Fetch roles, job titles, and companies when modal opens
      getRoles()
      getJobTitles()
      getCompanies()
    }
  }, [open, getRoles, getJobTitles, getCompanies])

  // Re-render when locale changes to update dropdown displays
  useEffect(() => {
    // Force re-render when locale changes
  }, [locale])

  useEffect(() => {
    if (user) {
      setFormData({
        nameAr: user.nameAr || '',
        nameEn: user.nameEn || '',
        email: user.email || '',
        phone: user.phone || '',
        roleId: typeof user.roleId === 'string' ? user.roleId : user.roleId?._id || '',
        jobTitleId: typeof user.jobTitleId === 'string' ? user.jobTitleId : user.jobTitleId?._id || '',
        companyId: typeof user.companyId === 'string' ? user.companyId : user.companyId?._id || '',
        username: user.username || '',
        password: ''
      })
      setPreviewUrl(user.profilePic || '')
    }
  }, [user])

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async () => {
    if (
      !formData.nameAr ||
      !formData.nameEn ||
      !formData.email ||
      !formData.username ||
      !formData.jobTitleId ||
      !formData.companyId
    ) {
      showErrorMessage(t('Please fill in all required fields'))
      return
    }

    // Resolve user id robustly
    const userId = (user as any)?._id || (user as any)?.id || (user as any)?.userId
    if (!userId) {
      showErrorMessage(t('Cannot update profile: missing user ID'))
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nameAr', formData.nameAr)
      formDataToSend.append('nameEn', formData.nameEn)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      // formDataToSend.append('roleId', formData.roleId)
      formDataToSend.append('jobTitleId', formData.jobTitleId)
      formDataToSend.append('companyId', formData.companyId)
      formDataToSend.append('username', formData.username)

      if (formData.password) {
        formDataToSend.append('password', formData.password)
      }

      if (selectedFile) {
        formDataToSend.append('profilePic', selectedFile)
      }

      // Get token from localStorage
      let token = localStorage.getItem('pfc-auth')
      if (token) {
        token = JSON.parse(token).state.token
      }

      const response = await Network.putFormData(`/users/update/my-profile`, formDataToSend, {
        Authorization: `Bearer ${token}`
      })

      if (!response.ok) {
        const errorMessage = (response.data as any)?.message || t('Failed to update profile')
        throw new Error(errorMessage)
      }

      const updatedUser = (response.data as any)?.data

      // Update the user data in the store
      updateUserData(updatedUser)

      // Refresh permissions to ensure all modules remain visible
      await refreshPermissions()

      showSuccessMessage(t('Profile updated successfully!'))
      onClose()
    } catch (error: any) {
      showErrorMessage(error.message || t('Failed to update profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(user.profilePic || '')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <DialogTitle>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <Typography variant='h6'>{t('Update Profile')}</Typography>
          <IconButton onClick={handleClose} size='small'>
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <Grid container spacing={3}>
          {/* Profile Picture */}
          <Grid item xs={12} display='flex' justifyContent='center' mb={2}>
            <Box position='relative'>
              <Avatar src={previewUrl} sx={{ width: 100, height: 100, fontSize: '2rem' }}>
                {user.nameEn?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='profile-pic-input'
                type='file'
                onChange={handleFileChange}
              />
              <label htmlFor='profile-pic-input'>
                <IconButton
                  component='span'
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                  size='small'
                >
                  <Icon icon='tabler:camera' />
                </IconButton>
              </label>
            </Box>
          </Grid>

          {/* Name Fields */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Name (English)')}
              value={formData.nameEn}
              onChange={e => handleInputChange('nameEn', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Name (Arabic)')}
              value={formData.nameAr}
              onChange={e => handleInputChange('nameAr', e.target.value)}
              required
              dir='rtl'
            />
          </Grid>

          {/* Username and Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Username')}
              value={formData.username}
              onChange={e => handleInputChange('username', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Email')}
              type='email'
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              required
            />
          </Grid>

          {/* Phone and Password */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Phone')}
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:plus' fontSize={16} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Password (leave blank to keep current)')}
              type='password'
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Icon icon='tabler:lock' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Role, Job Title, and Company Dropdowns */}
          {/* <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.roleId}
                onChange={e => handleInputChange('roleId', e.target.value)}
                label='Role'
                required
              >
                {roles.map(role => (
                  <MenuItem key={role._id} value={role._id}>
                    {locale === 'ar' ? role.nameAr : role.nameEn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>{t('Job Title')}</InputLabel>
              <Select
                value={formData.jobTitleId}
                onChange={e => handleInputChange('jobTitleId', e.target.value)}
                label={t('Job Title')}
                required
              >
                {jobTitles.map(jobTitle => (
                  <MenuItem key={jobTitle._id} value={jobTitle._id}>
                    {locale === 'ar' ? jobTitle.nameAr : jobTitle.nameEn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>{t('Company')}</InputLabel>
              <Select
                value={formData.companyId}
                onChange={e => handleInputChange('companyId', e.target.value)}
                label={t('Company')}
                required
              >
                {companies.map(company => (
                  <MenuItem key={company._id} value={company._id}>
                    {locale === 'ar' ? company.nameAr : company.nameEn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ direction: isRTL ? 'rtl' : 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <Button onClick={handleClose} disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <Icon icon='tabler:loader-2' /> : null}
        >
          {loading ? t('Updating...') : t('Update Profile')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProfileUpdateModal
