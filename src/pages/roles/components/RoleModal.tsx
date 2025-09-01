// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

// ** Store Imports
import useRoleStore from 'src/store/useRoleStore'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

// ** Components
import EnhancedPermissionMatrix from 'src/components/EnhancedPermissionMatrix'

// ** Types
import { IRole } from 'src/types/role'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils
import {
  strictArabicOnlyPattern,
  strictEnglishOnlyPattern,
  fieldRequiredMessage,
  strictArabicOnlyMessage,
  strictEnglishOnlyMessage
} from 'src/utils'

interface RoleModalProps {
  open: boolean
  role: IRole | null
  mode: 'view' | 'edit'
  onClose: () => void
  onSave?: (role: IRole) => void
}

const RoleModal = ({ open, role, mode, onClose, onSave }: RoleModalProps) => {
  const { t } = useTranslation()
  const { getUsersByRole, updateRole, convertRolePermissionsToIds, loading } = useRoleStore()

  // ** States
  const [roleName, setRoleName] = useState('')
  const [roleNameAr, setRoleNameAr] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [roleDescriptionAr, setRoleDescriptionAr] = useState('')
  const [roleUsers, setRoleUsers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [fullAccess, setFullAccess] = useState(false)

  // ** Load role data when modal opens
  useEffect(() => {
    if (role && open) {
      setRoleName(role.nameEn || '')
      setRoleNameAr(role.nameAr || '')
      setRoleDescription(role.descriptionEn || '')
      setRoleDescriptionAr(role.descriptionAr || '')

      // Load permission IDs
      const permissionIds = convertRolePermissionsToIds(role)
      setSelectedPermissionIds(permissionIds)
      setFullAccess(role.has_full_permission || false)

      loadRoleUsers()
    }
  }, [role, open])

  const loadRoleUsers = async () => {
    if (!role) return

    try {
      const users = await getUsersByRole(role._id)
      setRoleUsers(users)
    } catch (error) {
      console.error('Error loading role users:', error)
      setRoleUsers([])
    }
  }

  const handlePermissionChange = (permissionIds: string[]) => {
    setSelectedPermissionIds(permissionIds)
  }

  const handleFullAccessToggle = (hasFullAccess: boolean) => {
    setFullAccess(hasFullAccess)
  }

  const handleSave = async () => {
    if (!role || !onSave) return

    // Validate required fields
    if (!roleName.trim() || roleName.trim().length < 2 || !roleDescriptionAr.trim()) {
      return // The store will handle the error message
    }

    // Validate English fields - no Arabic characters allowed
    if (!strictEnglishOnlyPattern.test(roleName.trim())) return
    if (roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim())) return

    // Validate Arabic fields - no English characters allowed
    if (roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim())) return
    if (!strictArabicOnlyPattern.test(roleDescriptionAr.trim())) return

    setIsSubmitting(true)

    try {
      const updatedRole = {
        ...role,
        nameEn: roleName.trim(),
        nameAr: roleNameAr.trim() || roleName.trim(),
        descriptionEn: roleDescription.trim() || `${t('Role for')} ${roleName.trim()}`,
        descriptionAr: roleDescriptionAr.trim() || '',
        permissionIds: selectedPermissionIds,
        permissions: selectedPermissionIds,
        has_full_permission: fullAccess
      }

      const success = await updateRole(role._id, updatedRole)
      if (success) {
        onSave(updatedRole as IRole)
        onClose()
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='body'>
      <DialogTitle
        sx={{
          textAlign: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h5' component='span'>
            {mode === 'edit' ? t('Edit Role') : t('View Role')}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant='body2'>
          {mode === 'edit' ? t('Update role information and permissions') : t('Role details and permissions')}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(5)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
        }}
      >
        {role && (
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {t('Basic Information')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('Role Name (English)')}
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    disabled={mode === 'view'}
                    required
                    error={
                      mode === 'edit' &&
                      (!roleName.trim() ||
                        roleName.trim().length < 2 ||
                        !strictEnglishOnlyPattern.test(roleName.trim()))
                    }
                    helperText={
                      mode === 'edit' && !roleName.trim()
                        ? t('Field is required')
                        : mode === 'edit' && roleName.trim().length < 2
                        ? t('Role name must be at least 2 characters')
                        : mode === 'edit' && roleName.trim() && !strictEnglishOnlyPattern.test(roleName.trim())
                        ? strictEnglishOnlyMessage
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('Role Name (Arabic)')}
                    value={roleNameAr}
                    onChange={e => setRoleNameAr(e.target.value)}
                    disabled={mode === 'view'}
                    error={mode === 'edit' && roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim())}
                    helperText={
                      mode === 'edit' && roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim())
                        ? strictArabicOnlyMessage
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('Description (English)')}
                    value={roleDescription}
                    onChange={e => setRoleDescription(e.target.value)}
                    multiline
                    rows={2}
                    disabled={mode === 'view'}
                    inputProps={{ maxLength: 200 }}
                    error={
                      mode === 'edit' &&
                      roleDescription.trim() &&
                      !strictEnglishOnlyPattern.test(roleDescription.trim())
                    }
                    helperText={
                      mode === 'edit' &&
                      roleDescription.trim() &&
                      !strictEnglishOnlyPattern.test(roleDescription.trim())
                        ? strictEnglishOnlyMessage
                        : roleDescription.length > 0
                        ? `Limit: ${roleDescription.length}/200`
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('Description (Arabic)')}
                    value={roleDescriptionAr}
                    onChange={e => setRoleDescriptionAr(e.target.value)}
                    multiline
                    rows={2}
                    disabled={mode === 'view'}
                    required={mode === 'edit'}
                    inputProps={{ maxLength: 200 }}
                    error={
                      mode === 'edit' &&
                      (!roleDescriptionAr.trim() || !strictArabicOnlyPattern.test(roleDescriptionAr.trim()))
                    }
                    helperText={
                      mode === 'edit' && !roleDescriptionAr.trim()
                        ? t('Field is required')
                        : mode === 'edit' &&
                          roleDescriptionAr.trim() &&
                          !strictArabicOnlyPattern.test(roleDescriptionAr.trim())
                        ? strictArabicOnlyMessage
                        : roleDescriptionAr.length > 0
                        ? `Limit: ${roleDescriptionAr.length}/200`
                        : ''
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Users */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {t('Assigned Users')} ({roleUsers.length})
              </Typography>
              {roleUsers.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                    {roleUsers.map((user: any, index: number) => (
                      <Avatar key={index} alt={user.nameEn || user.username} src={user.profilePic}>
                        {(user.nameEn || user.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant='body2' color='text.secondary'>
                    {roleUsers.length} {t('users assigned')}
                  </Typography>
                </Box>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('No users assigned to this role')}
                </Typography>
              )}
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <EnhancedPermissionMatrix
                selectedPermissionIds={selectedPermissionIds}
                hasFullAccess={fullAccess}
                onPermissionChange={handlePermissionChange}
                onFullAccessChange={handleFullAccessToggle}
                disabled={mode === 'view'}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Box className='demo-space-x'>
          {mode === 'edit' && (
            <Button
              variant='contained'
              onClick={handleSave}
              disabled={isSubmitting || !roleName.trim() || roleName.trim().length < 2 || !roleDescriptionAr.trim()}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? t('Saving...') : t('Save Changes')}
            </Button>
          )}
          <Button color='secondary' variant='outlined' onClick={onClose}>
            {t('Close')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default RoleModal
