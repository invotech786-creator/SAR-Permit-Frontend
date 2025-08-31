import { FC, useEffect, useState, useRef, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FallbackSpinner from 'src/@core/components/spinner'
import Backdrop from '@mui/material/Backdrop'
import IconButton from '@mui/material/IconButton'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'

import { ErrorMessage, showErrorMessage } from 'src/components'
import { IUserPayload } from 'src/types'
import useUserStore from 'src/store/useUserStore'
import {
  arabicCharacterRequiredMessage,
  arabicNameOrNumberPattern,
  englishCharacterRequiredMessage,
  englishNameOrNumberPattern,
  fieldRequiredMessage
} from 'src/utils'
import { useRoleStore, useAuthStore, useCompanyStore, useJobTitleStore, useDepartmentStore } from 'src/store'
import { useTranslation } from 'react-i18next'
import Icon from 'src/@core/components/icon'
import JobTitleModal from '../../jobtitles/components/JobTitleModal'

interface Props {
  open: boolean
  toggle: () => void
  userId?: string
  mode: 'Add' | 'Edit' | 'View'
  initialUserData?: any
}

interface FormValues extends IUserPayload {
  password: string
}

const UserModal: FC<Props> = ({ open, toggle, userId, mode, initialUserData }) => {
  const { createUser, updateUser, user, getUser } = useUserStore()
  const { roles, getRoles } = useRoleStore()
  const { user: loggedInUser, updateUserData } = useAuthStore()
  const { companies, getCompanies } = useCompanyStore()
  const { jobTitles, getJobTitles } = useJobTitleStore()
  const { departments, getDepartments } = useDepartmentStore()
  const {
    t,
    i18n: { language }
  } = useTranslation()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [jobTitleModalOpen, setJobTitleModalOpen] = useState(false)
  // Initialize userLoading based on whether we need to fetch data
  const [userLoading, setUserLoading] = useState(mode !== 'Add' && userId && !(mode === 'View' && initialUserData))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validationSchema = yup.object().shape({
    nameAr: yup
      .string()
      .required(t('Field is required'))
      .matches(arabicNameOrNumberPattern, arabicCharacterRequiredMessage),
    nameEn: yup
      .string()
      .required(t('Field is required'))
      .matches(englishNameOrNumberPattern, englishCharacterRequiredMessage),
    email: yup.string().email().required(t('Field is required')),
    phone: yup.string().required(t('Field is required')),
    username: yup.string().required(t('Field is required')),
    roleId: yup.string().required(t('Field is required')),
    password:
      mode === 'Add'
        ? yup
            .string()
            .required(t('Field is required'))
            .min(6, t('Password must be at least 6 characters'))
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              t('Password must contain at least one uppercase letter, one lowercase letter, and one number')
            )
        : yup
            .string()
            .min(6, t('Password must be at least 6 characters'))
            .matches(
              /^$|^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              t('Password must contain at least one uppercase letter, one lowercase letter, and one number')
            )
  })

  // Use initialUserData if provided (for View mode), otherwise use user from store
  const currentUser = mode === 'View' && initialUserData ? initialUserData : user

  const initialValues: FormValues = {
    nameAr: mode === 'Add' ? '' : currentUser?.nameAr || '',
    nameEn: mode === 'Add' ? '' : currentUser?.nameEn || '',
    email: mode === 'Add' ? '' : currentUser?.email || '',
    phone: mode === 'Add' ? '' : currentUser?.phone || '',
    username: mode === 'Add' ? '' : currentUser?.username || '',
    password: '',
    roleId:
      mode === 'Add'
        ? ''
        : ((typeof currentUser?.role === 'object' && currentUser?.role !== null
            ? currentUser.role._id
            : typeof currentUser?.roleId === 'object' &&
              currentUser?.roleId !== null &&
              currentUser?.roleId &&
              '_id' in currentUser?.roleId
            ? (currentUser.roleId as any)._id
            : currentUser?.roleId || currentUser?.role || '') as string),
    companyId:
      mode === 'Add'
        ? ''
        : typeof currentUser?.companyId === 'string'
        ? currentUser.companyId
        : typeof currentUser?.companyId === 'object' && currentUser?.companyId !== null
        ? currentUser.companyId._id
        : typeof currentUser?.company === 'string'
        ? currentUser.company
        : currentUser?.company?._id || '',
    jobTitleId:
      mode === 'Add'
        ? ''
        : typeof currentUser?.jobTitleId === 'string'
        ? currentUser.jobTitleId
        : typeof currentUser?.jobTitleId === 'object' && currentUser?.jobTitleId !== null
        ? currentUser.jobTitleId._id
        : typeof currentUser?.jobTitle === 'string'
        ? currentUser.jobTitle
        : currentUser?.jobTitle?._id || '',
    departmentId:
      mode === 'Add'
        ? ''
        : typeof currentUser?.departmentId === 'string'
        ? currentUser.departmentId
        : typeof currentUser?.departmentId === 'object' && currentUser?.departmentId !== null
        ? currentUser.departmentId._id
        : typeof currentUser?.department === 'string'
        ? currentUser.department
        : currentUser?.department?._id || ''
  }

  // Check if form has changes compared to original user data
  const checkForChanges = useCallback(
    (values: FormValues) => {
      if (mode === 'Add') {
        // For Add mode, check if any field has been filled
        return Object.values(values).some(value => value !== '') || selectedFile !== null
      }

      const originalData = {
        nameAr: currentUser?.nameAr || '',
        nameEn: currentUser?.nameEn || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        username: currentUser?.username || '',
        roleId: (typeof currentUser?.role === 'object' && currentUser?.role !== null
          ? currentUser.role._id
          : typeof currentUser?.roleId === 'object' &&
            currentUser?.roleId !== null &&
            currentUser.roleId &&
            '_id' in currentUser.roleId
          ? (currentUser.roleId as any)._id
          : currentUser?.roleId || currentUser?.role || '') as string,
        companyId: (typeof currentUser?.companyId === 'string'
          ? currentUser.companyId
          : typeof currentUser?.companyId === 'object' && currentUser?.companyId !== null
          ? currentUser.companyId._id
          : typeof currentUser?.company === 'string'
          ? currentUser.company
          : currentUser?.company?._id || '') as string,
        jobTitleId: (typeof currentUser?.jobTitleId === 'string'
          ? currentUser.jobTitleId
          : typeof currentUser?.jobTitleId === 'object' && currentUser?.jobTitleId !== null
          ? currentUser.jobTitleId._id
          : typeof currentUser?.jobTitle === 'string'
          ? currentUser.jobTitle
          : currentUser?.jobTitle?._id || '') as string,
        departmentId: (typeof currentUser?.departmentId === 'string'
          ? currentUser.departmentId
          : typeof currentUser?.departmentId === 'object' && currentUser?.departmentId !== null
          ? currentUser.departmentId._id
          : typeof currentUser?.department === 'string'
          ? currentUser.department
          : currentUser?.department?._id || '') as string
      }

      const hasFormChanges = Object.keys(originalData).some(
        key => values[key as keyof FormValues] !== originalData[key as keyof typeof originalData]
      )

      const hasPasswordChange = values.password !== ''
      const hasFileChange = selectedFile !== null || imageRemoved

      return hasFormChanges || hasPasswordChange || hasFileChange
    },
    [mode, currentUser, selectedFile, imageRemoved]
  )

  useEffect(() => {
    if (userId && open && mode !== 'Add') {
      // If initialUserData is provided (like from the parent component), use it
      if (initialUserData && mode === 'View') {
        // For View mode, we can use the initial data directly without additional API call
        setUserLoading(false)
      } else {
        // For Edit mode or when no initial data, fetch fresh data
        setUserLoading(true)
        getUser(userId).finally(() => setUserLoading(false))
      }
    }
  }, [userId, open, getUser, mode, initialUserData])

  useEffect(() => {
    if (open) {
      getRoles()
      getCompanies({ limit: 1000 })
      getJobTitles({ limit: 1000 })
      getDepartments({ limit: 1000 })
    }
  }, [open, getRoles, getCompanies, getJobTitles, getDepartments])

  // Reset form when mode changes
  useEffect(() => {
    if (mode === 'Add') {
      setSelectedFile(null)
      setPreviewUrl(null)
      setImageRemoved(false)
      setHasChanges(false)
    }
  }, [mode])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        showErrorMessage(t('Please select a valid image file (PNG or JPG only)'))
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      setSelectedFile(file)
      setImageRemoved(false) // Reset image removed flag when new file is selected
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setImageRemoved(true) // Mark that image should be removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleJobTitleModalToggle = () => {
    setJobTitleModalOpen(!jobTitleModalOpen)
  }

  const handleJobTitleAdded = () => {
    getJobTitles({ limit: 1000 })
    setJobTitleModalOpen(false)
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    const { password, ...rest } = values
    const payload = password ? { ...rest, password } : rest

    // Handle profile picture
    if (selectedFile) {
      payload.profilePic = selectedFile
    } else if (imageRemoved && mode === 'Edit') {
      // Send empty string to remove existing image
      ;(payload as any).profilePic = ''
    }

    try {
      if (mode === 'Add') {
        const success = await createUser(payload)
        if (success) {
          toggle()
        }
      } else if (user?._id) {
        const success = await updateUser(user._id, payload)
        if (success) {
          // If the updated user is the logged-in user, refresh their data
          if (loggedInUser?._id === user._id) {
            // Fetch updated user data and update auth store
            const updatedUser = await getUser(user._id)
            if (updatedUser) {
              updateUserData(updatedUser)
            }
          }
          toggle()
        }
      }
    } catch (error) {
      console.error('Error submitting user form:', error)
    } finally {
      setLoading(false)
    }
  }

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true
  })

  // Update hasChanges whenever form values change
  useEffect(() => {
    const changes = checkForChanges(values)
    setHasChanges(changes)
  }, [values, selectedFile, imageRemoved, mode, currentUser, checkForChanges])

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={toggle}
      TransitionProps={{
        onEntered: () => {
          // Ensure smooth transition
        }
      }}
    >
      <form onSubmit={e => e.preventDefault()}>
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          {t(`${mode} User`)}
          <IconButton
            onClick={toggle}
            sx={{
              position: 'absolute',
              right: theme => theme.spacing(2),
              top: theme => theme.spacing(2),
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {mode !== 'Add' && userLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                width: '100%'
              }}
            >
              <FallbackSpinner />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={
                        mode === 'Add'
                          ? previewUrl || undefined
                          : previewUrl || (imageRemoved ? undefined : currentUser?.profilePic) || undefined
                      }
                      sx={{
                        width: 80,
                        height: 80,
                        border:
                          !previewUrl && (mode === 'Add' || !currentUser?.profilePic || imageRemoved)
                            ? '2px solid #00778B'
                            : 'none',
                        backgroundColor:
                          !previewUrl && (mode === 'Add' || !currentUser?.profilePic || imageRemoved)
                            ? 'transparent'
                            : 'primary.main'
                      }}
                    >
                      {!previewUrl && (mode === 'Add' || !currentUser?.profilePic || imageRemoved) ? (
                        <Icon
                          icon={
                            mode === 'Add' ? 'tabler:user-plus' : mode === 'Edit' ? 'tabler:user-edit' : 'tabler:user'
                          }
                          fontSize={32}
                          color='#00778B'
                        />
                      ) : (
                        `${currentUser?.nameEn?.charAt(0) || ''}${currentUser?.nameAr?.charAt(0) || ''}`
                      )}
                    </Avatar>
                    {mode !== 'View' && (
                      <Box>
                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/jpeg,image/png'
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        <Button variant='outlined' onClick={() => fileInputRef.current?.click()} sx={{ mr: 1 }}>
                          {previewUrl || (mode !== 'Add' && currentUser?.profilePic && !imageRemoved)
                            ? t('Change Photo')
                            : t('Upload Photo')}
                        </Button>
                        {(previewUrl || (mode !== 'Add' && currentUser?.profilePic && !imageRemoved)) && (
                          <Button variant='outlined' color='error' onClick={handleRemoveFile}>
                            {t('Remove')}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <TextField
                    label={t('Name (Arabic)')}
                    name='nameAr'
                    value={values.nameAr}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    multiline
                    minRows={1}
                    maxRows={3}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '56px',
                        minHeight: '56px',
                        maxHeight: 'none',
                        alignItems: 'center',
                        '&.MuiInputBase-multiline': {
                          height: 'auto',
                          minHeight: '56px',
                          alignItems: 'flex-start',
                          paddingTop: '16.5px',
                          paddingBottom: '16.5px'
                        }
                      },
                      '& .MuiInputBase-input': {
                        fontFamily: 'Arial, Tahoma, sans-serif',
                        direction: 'rtl',
                        textAlign: 'right',
                        lineHeight: '1.4375em',
                        padding: '0px 14px',
                        overflow: 'hidden',
                        resize: 'none'
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Arial, Tahoma, sans-serif',
                        direction: 'rtl',
                        textAlign: 'right'
                      }
                    }}
                  />
                  <ErrorMessage error={errors.nameAr} touched={touched.nameAr} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <TextField
                    label={t('Name (English)')}
                    name='nameEn'
                    value={values.nameEn}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                  />
                  <ErrorMessage error={errors.nameEn} touched={touched.nameEn} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <TextField
                    label={t('Email')}
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                  />
                  <ErrorMessage error={errors.email} touched={touched.email} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <TextField
                    label={t('Phone')}
                    name='phone'
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                  />
                  <ErrorMessage error={errors.phone} touched={touched.phone} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <TextField
                    label={t('Username')}
                    name='username'
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                  />
                  <ErrorMessage error={errors.username} touched={touched.username} />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <InputLabel>{t('Role')}</InputLabel>
                  <Select
                    name='roleId'
                    fullWidth
                    value={values.roleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    label={t('Role')}
                  >
                    {(roles || []).map(role => (
                      <MenuItem key={role._id} value={role._id}>
                        {language === 'ar' ? role.nameAr : role.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  <ErrorMessage error={errors.roleId} touched={touched.roleId} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <InputLabel>{t('Company')}</InputLabel>
                  <Select
                    name='companyId'
                    fullWidth
                    value={values.companyId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    label={t('Company')}
                  >
                    {(companies || []).map(company => (
                      <MenuItem key={company._id} value={company._id}>
                        {language === 'ar' ? company.nameAr : company.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <InputLabel>{t('Job Title')}</InputLabel>
                  <Select
                    name='jobTitleId'
                    fullWidth
                    value={values.jobTitleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    label={t('Job Title')}
                  >
                    {(jobTitles || []).map(jobTitle => (
                      <MenuItem key={jobTitle._id} value={jobTitle._id}>
                        {language === 'ar' ? jobTitle.nameAr : jobTitle.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  {mode !== 'View' && (
                    <Button
                      onClick={handleJobTitleModalToggle}
                      variant='text'
                      size='small'
                      sx={{ mt: 1, alignSelf: 'flex-start' }}
                    >
                      {t('Add New Job Title')}
                    </Button>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <InputLabel>{t('Department')}</InputLabel>
                  <Select
                    name='departmentId'
                    fullWidth
                    value={values.departmentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    label={t('Department')}
                  >
                    {(departments || []).map(department => (
                      <MenuItem key={department._id} value={department._id}>
                        {language === 'ar' ? department.nameAr : department.nameEn}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {mode === 'Add' && (
                <Grid item xs={12} sm={12} md={6}>
                  <FormControl fullWidth sx={{ mt: 4 }}>
                    <TextField
                      label={t('Password')}
                      name='password'
                      type='password'
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage error={errors.password} touched={touched.password} />
                  </FormControl>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggle} variant='outlined' color='secondary' type='button' disabled={loading}>
            {t('Cancel')}
          </Button>
          {mode !== 'View' && (
            <Button
              onClick={() => handleSubmit()}
              variant='contained'
              disabled={loading || (mode === 'Edit' && !hasChanges)}
            >
              {t('Save')}
            </Button>
          )}
        </DialogActions>
      </form>

      {/* Loading Overlay */}
      <Backdrop
        sx={{
          color: '#00778B',
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'transparent'
        }}
        open={loading}
      >
        <FallbackSpinner />
      </Backdrop>

      {/* Job Title Modal */}
      <JobTitleModal
        open={jobTitleModalOpen}
        toggle={handleJobTitleModalToggle}
        mode='Add'
        onSuccess={handleJobTitleAdded}
      />
    </Dialog>
  )
}

export default UserModal
