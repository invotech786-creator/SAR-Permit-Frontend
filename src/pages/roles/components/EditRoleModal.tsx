// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
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
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

// ** Store Imports
import useRoleStore from 'src/store/useRoleStore'
import usePermissionStore from 'src/store/usePermissionStore'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

// ** Types
import { IRole } from 'src/types/role'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import CloseIcon from '@mui/icons-material/Close'

// ** Components
import EnhancedPermissionMatrix from 'src/components/EnhancedPermissionMatrix'

// ** Utils
import { 
  strictArabicOnlyPattern, 
  strictEnglishOnlyPattern, 
  fieldRequiredMessage, 
  strictArabicOnlyMessage, 
  strictEnglishOnlyMessage 
} from 'src/utils'

interface EditRoleModalProps {
  open: boolean
  role: IRole | null
  onClose: () => void
  onSave: (role: IRole) => void
}

const EditRoleModal = ({ open, role, onClose, onSave }: EditRoleModalProps) => {
  const { t } = useTranslation()
  const { updateRole, loading } = useRoleStore()
  const { moduleInfo, fetchPermissions, getAllPermissionIds } = usePermissionStore()

  // ** States
  const [roleName, setRoleName] = useState('')
  const [roleNameAr, setRoleNameAr] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [roleDescriptionAr, setRoleDescriptionAr] = useState('')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fullAccess, setFullAccess] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // ** Fetch permissions on component mount
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // ** Initialize form when role changes
  useEffect(() => {
    if (role) {
      setRoleName(role.nameEn || '')
      setRoleNameAr(role.nameAr || '')
      setRoleDescription(role.descriptionEn || '')
      setRoleDescriptionAr(role.descriptionAr || '')
      setIsActive(role.isActive ?? true)

      // Set selected permission IDs
      const permissionIds = role.permissions || []
      setSelectedPermissionIds(permissionIds)

      // Check if all permissions are selected (full access)
      const allPermissionIds = getAllPermissionIds()
      const allPermissionsSelected = allPermissionIds.length > 0 &&
        allPermissionIds.every(id => permissionIds.includes(id))
      setFullAccess(allPermissionsSelected)
    } else {
      setRoleName('')
      setRoleNameAr('')
      setRoleDescription('')
      setRoleDescriptionAr('')
      setSelectedPermissionIds([])
      setFullAccess(false)
      setIsActive(true)
    }
  }, [role])

  const handleClose = () => {
    setRoleName('')
    setRoleNameAr('')
    setRoleDescription('')
    setRoleDescriptionAr('')
    setSelectedPermissionIds([])
    setIsSubmitting(false)
    setFullAccess(false)
    setIsActive(true)
    onClose()
  }

  const handlePermissionChange = (permissionIds: string[]) => {
    setSelectedPermissionIds(permissionIds)
  }

  const handleFullAccessChange = (checked: boolean) => {
    setFullAccess(checked)
    if (checked) {
      // Grant full access - select all permissions
      const allPermissionIds = getAllPermissionIds()
      setSelectedPermissionIds(allPermissionIds)
    } else {
      // Remove all permissions
      setSelectedPermissionIds([])
    }
  }

  const handleSave = async () => {
    if (!role || !roleName.trim() || !roleDescriptionAr.trim()) return
    
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
      const success = await updateRole(role._id, roleData)
      if (success) {
        onSave({ ...role, ...roleData })
        handleClose()
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog fullWidth maxWidth='md' scroll='body' onClose={handleClose} open={open}>
      <DialogTitle
        sx={{
          textAlign: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Typography variant='h5' component='span'>
          {t('Edit Role')}
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
                error={Boolean(roleName.trim() && !strictEnglishOnlyPattern.test(roleName.trim()))}
                helperText={
                  !roleName.trim() ? t('Field is required')
                  : roleName.trim() && !strictEnglishOnlyPattern.test(roleName.trim()) ? strictEnglishOnlyMessage
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
                error={Boolean(roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim()))}
                helperText={
                  roleDescription.trim() && !strictEnglishOnlyPattern.test(roleDescription.trim()) ? strictEnglishOnlyMessage : ''
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
                error={Boolean(!roleDescriptionAr.trim() || !strictArabicOnlyPattern.test(roleDescriptionAr.trim()))}
                helperText={
                  !roleDescriptionAr.trim() ? t('Field is required')
                  : !strictArabicOnlyPattern.test(roleDescriptionAr.trim()) ? strictArabicOnlyMessage
                  : ''
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('Role Status')}</InputLabel>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  label={t('Role Status')}
                >
                  <MenuItem value="active">{t('Active')}</MenuItem>
                  <MenuItem value="inactive">{t('Inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <EnhancedPermissionMatrix
          selectedPermissionIds={selectedPermissionIds}
          hasFullAccess={fullAccess}
          onPermissionChange={handlePermissionChange}
          onFullAccessChange={handleFullAccessChange}
          disabled={isSubmitting}
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
  )
}

export default EditRoleModal
