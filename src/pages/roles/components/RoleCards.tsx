// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import AvatarGroup from '@mui/material/AvatarGroup'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'

// ** Store Imports
import useRoleStore from 'src/store/useRoleStore'
import useAuthStore from 'src/store/useAuthStore'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

// ** Types
import { IRole } from 'src/types/role'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils
import { getBilingualText, getRoleBilingualDescription, getRoleDisplayName } from 'src/utils/multilingual'
import {
  strictArabicOnlyPattern,
  strictEnglishOnlyPattern,
  fieldRequiredMessage,
  strictArabicOnlyMessage,
  strictEnglishOnlyMessage
} from 'src/utils'

// ** Components
import CustomChip from 'src/@core/components/mui/chip'
import EnhancedPermissionMatrix from 'src/components/EnhancedPermissionMatrix'

interface RoleCardsProps {
  roles: IRole[]
}

// ** Vars
const roleStatusObj: { [key: string]: any } = {
  active: 'success',
  inactive: 'secondary'
}

const RoleCards = ({ roles }: RoleCardsProps) => {
  const { t, i18n } = useTranslation()
  const {
    addRole,
    updateRole,
    deleteRole,
    bulkDeleteRoles,
    bulkToggleRoles,
    assignUsersToRole,
    removeUsersFromRole,
    getUsersByRole,
    convertRolePermissionsToIds,
    loading
  } = useRoleStore()

  const { hasPermission } = useAuthStore()

  // ** States
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleNameAr, setRoleNameAr] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [roleDescriptionAr, setRoleDescriptionAr] = useState('')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roleUsers, setRoleUsers] = useState<{ [roleId: string]: any[] }>({})
  const [fullAccess, setFullAccess] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // ** Load users for a specific role on demand to prevent excessive API calls
  const loadUsersForRole = async (roleId: string) => {
    if (roleUsers[roleId] !== undefined) return // Already loaded or loading

    try {
      const users = await getUsersByRole(roleId)
      setRoleUsers(prev => ({
        ...prev,
        [roleId]: users
      }))
    } catch (error) {
      console.error(`Error loading users for role ${roleId}:`, error)
      setRoleUsers(prev => ({
        ...prev,
        [roleId]: []
      }))
    }
  }

  // ** Handlers
  const handleClickOpen = (role?: IRole) => {
    if (role) {
      setSelectedRole(role)
      setRoleName(role.nameEn || '')
      setRoleNameAr(role.nameAr || '')
      setRoleDescription(role.descriptionEn || '')
      setRoleDescriptionAr(role.descriptionAr || '')
      setIsActive(role.isActive ?? true)

      // Set permission IDs from role
      const permissionIds = convertRolePermissionsToIds(role)
      setSelectedPermissionIds(permissionIds)

      // Check if role has full access
      setFullAccess(role.has_full_permission || false)
    } else {
      setSelectedRole(null)
      setRoleName('')
      setRoleNameAr('')
      setRoleDescription('')
      setRoleDescriptionAr('')
      setSelectedPermissionIds([])
      setFullAccess(false)
      setIsActive(true)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedRole(null)
    setRoleName('')
    setRoleNameAr('')
    setRoleDescription('')
    setRoleDescriptionAr('')
    setSelectedPermissionIds([])
    setIsSubmitting(false)
    setFullAccess(false)
    setIsActive(true)
  }

  const handlePermissionChange = (permissionIds: string[]) => {
    setSelectedPermissionIds(permissionIds)
  }

  const handleFullAccessToggle = (hasFullAccess: boolean) => {
    setFullAccess(hasFullAccess)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!roleName.trim() || !roleDescriptionAr.trim()) return

    // Validate English fields - no Arabic characters allowed
    if (!strictEnglishOnlyPattern.test(roleName.trim())) return
    if (roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim())) return

    // Validate Arabic fields - no English characters allowed
    if (roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim())) return
    if (!strictArabicOnlyPattern.test(roleDescriptionAr.trim())) return

    setIsSubmitting(true)

    const roleData = {
      nameEn: roleName.trim(),
      nameAr: roleNameAr.trim() || roleName.trim(),
      descriptionEn: roleDescription.trim() || `${t('Role for')} ${roleName.trim()}`,
      descriptionAr: roleDescriptionAr.trim() || '',
      permissions: selectedPermissionIds,
      has_full_permission: fullAccess,
      isSuperAdmin: false,
      isActive: isActive
    }

    try {
      let success = false
      if (selectedRole) {
        success = await updateRole(selectedRole._id as string, roleData)
      } else {
        success = await addRole(roleData)
      }

      if (success) {
        handleClose()
      }
    } catch (error) {
      console.error('Error saving role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    const confirmed = window.confirm(t('Are you sure you want to delete this role?'))
    if (!confirmed) return

    try {
      await deleteRole(roleId)
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleCopyRole = async (role: IRole) => {
    const confirmed = window.confirm(t('Are you sure you want to copy this role?'))
    if (!confirmed) return

    const roleData = {
      nameEn: `${role.nameEn} ${t('(Copy)')}`,
      nameAr: `${role.nameAr} ${t('(Copy)')}`,
      descriptionEn: `${role.descriptionEn || ''} ${t('(Copy)')}`,
      descriptionAr: `${role.descriptionAr || ''} ${t('(Copy)')}`,
      permissions: role.permissions,
      has_full_permission: role.has_full_permission,
      isSuperAdmin: role.isSuperAdmin,
      isActive: true
    }

    try {
      await addRole(roleData)
    } catch (error) {
      console.error('Error copying role:', error)
    }
  }

  const renderRoleCards = () => {
    return roles.map((role, index) => {
      const users = roleUsers[role._id as string]
      const totalUsers = users ? users.length : 0
      const isUsersLoaded = users !== undefined

      return (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary' }}>
                  {isUsersLoaded ? `${t('Total')} ${totalUsers} ${t('users')}` : t('Role')}
                </Typography>
                {isUsersLoaded ? (
                  <AvatarGroup
                    max={4}
                    className='pull-up'
                    sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}
                  >
                    {users.slice(0, 4).map((user: any, userIndex: number) => (
                      <Avatar key={userIndex} alt={user.nameEn || user.username} src={user.profilePic}>
                        {(user.nameEn || user.username || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant='caption'
                      sx={{ color: 'primary.main', cursor: 'pointer' }}
                      onClick={() => loadUsersForRole(role._id as string)}
                    >
                      {t('Load Users')}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h5'>{getRoleDisplayName(role, i18n.language)}</Typography>
                    <CustomChip
                      rounded
                      skin='light'
                      size='small'
                      label={role.isActive ? t('Active') : t('Inactive')}
                      color={roleStatusObj[role.isActive ? 'active' : 'inactive']}
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography
                    component='span'
                    sx={{
                      color: hasPermission('role-management', 'update') ? 'primary.main' : 'text.disabled',
                      textDecoration: 'none',
                      cursor: hasPermission('role-management', 'update') ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => hasPermission('role-management', 'update') && handleClickOpen(role)}
                  >
                    {t('Edit Role')}
                  </Typography>
                </Box>
                <IconButton size='small' sx={{ color: 'text.disabled' }} onClick={() => handleCopyRole(role)}>
                  <Icon icon='tabler:copy' />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )
    })
  }

  return (
    <Grid container spacing={6} className='match-height'>
      {renderRoleCards()}
      <Grid item xs={12} sm={6} lg={4}>
        <Card
          sx={{
            cursor: hasPermission('role-management', 'create') ? 'pointer' : 'not-allowed',
            opacity: hasPermission('role-management', 'create') ? 1 : 0.6
          }}
          onClick={() => hasPermission('role-management', 'create') && handleClickOpen()}
        >
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={5}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon
                  icon='tabler:user-plus'
                  style={{
                    fontSize: '4rem',
                    color: 'var(--mui-palette-primary-main)',
                    opacity: hasPermission('role-management', 'create') ? 0.7 : 0.3
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={7}>
              <CardContent sx={{ pl: 0, height: '100%' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Button
                    variant='contained'
                    sx={{ mb: 3, whiteSpace: 'nowrap' }}
                    onClick={() => hasPermission('role-management', 'create') && handleClickOpen()}
                    disabled={!hasPermission('role-management', 'create')}
                  >
                    + {t('Add New Role')}
                  </Button>
                  <Typography sx={{ color: 'text.secondary' }}>{t("Add role, if it doesn't exist.")}</Typography>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Dialog fullWidth maxWidth='md' scroll='body' onClose={handleClose} open={open}>
        <DialogTitle
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h5' component='span'>
            {selectedRole ? t('Edit Role') : t('Add Role')}
          </Typography>
          <Typography variant='body2'>{t('Set Role Permissions')}</Typography>
          <IconButton
            onClick={handleClose}
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
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(5)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <Box sx={{ my: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Role Name (English)')}
                  placeholder={t('Enter Role Name')}
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  required
                  error={Boolean(
                    !roleName.trim() || (roleName.trim() && !strictEnglishOnlyPattern.test(roleName.trim()))
                  )}
                  helperText={
                    !roleName.trim()
                      ? t('Field is required')
                      : roleName.trim() && !strictEnglishOnlyPattern.test(roleName.trim())
                      ? strictEnglishOnlyMessage
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Role Name (Arabic)')}
                  placeholder={t('Enter role name in Arabic')}
                  value={roleNameAr}
                  onChange={e => setRoleNameAr(e.target.value)}
                  error={Boolean(roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim()))}
                  helperText={
                    roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim()) ? strictArabicOnlyMessage : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Description (English)')}
                  placeholder={t('Enter role description')}
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  multiline
                  rows={2}
                  inputProps={{ maxLength: 200 }}
                  error={Boolean(roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim()))}
                  helperText={
                    roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim())
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
                  placeholder={t('Enter role description in Arabic')}
                  value={roleDescriptionAr}
                  onChange={e => setRoleDescriptionAr(e.target.value)}
                  multiline
                  rows={2}
                  required
                  inputProps={{ maxLength: 200 }}
                  error={Boolean(!roleDescriptionAr.trim() || !strictArabicOnlyPattern.test(roleDescriptionAr.trim()))}
                  helperText={
                    !roleDescriptionAr.trim()
                      ? t('Field is required')
                      : !strictArabicOnlyPattern.test(roleDescriptionAr.trim())
                      ? strictArabicOnlyMessage
                      : roleDescriptionAr.length > 0
                      ? `Limit: ${roleDescriptionAr.length}/200`
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('Role Status')}</InputLabel>
                  <Select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={e => setIsActive(e.target.value === 'active')}
                    label={t('Role Status')}
                  >
                    <MenuItem value='active'>{t('Active')}</MenuItem>
                    <MenuItem value='inactive'>{t('Inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          <EnhancedPermissionMatrix
            selectedPermissionIds={selectedPermissionIds}
            hasFullAccess={fullAccess}
            onPermissionChange={handlePermissionChange}
            onFullAccessChange={handleFullAccessToggle}
            disabled={false}
          />
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
            <Button
              type='submit'
              variant='contained'
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !roleName.trim() ||
                !roleDescriptionAr.trim() ||
                !strictEnglishOnlyPattern.test(roleName.trim()) ||
                (roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim())) ||
                (roleNameAr.trim() && !strictArabicOnlyPattern.test(roleNameAr.trim())) ||
                !strictArabicOnlyPattern.test(roleDescriptionAr.trim() || ' ')
              }
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? t('Saving...') : t('Submit')}
            </Button>
            <Button color='secondary' variant='outlined' onClick={handleClose} disabled={isSubmitting}>
              {t('Cancel')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RoleCards
