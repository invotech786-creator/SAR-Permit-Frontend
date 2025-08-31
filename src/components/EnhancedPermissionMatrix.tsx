// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import SvgIcon from '@mui/material/SvgIcon'

// ** Stores
import usePermissionStore, { Permission } from 'src/store/usePermissionStore'

// Custom Info Icon Component
const InfoIcon = (props: any) => (
  <SvgIcon {...props}>
    <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5'>
      <circle cx='12' cy='12' r='9'></circle>
      <path d='M12 8h.01M11 12h1v4h1'></path>
    </g>
  </SvgIcon>
)

interface EnhancedPermissionMatrixProps {
  selectedPermissionIds: string[]
  hasFullAccess: boolean
  onPermissionChange: (permissionIds: string[]) => void
  onFullAccessChange: (hasFullAccess: boolean) => void
  disabled?: boolean
}

const EnhancedPermissionMatrix = ({
  selectedPermissionIds,
  hasFullAccess,
  onPermissionChange,
  onFullAccessChange,
  disabled = false
}: EnhancedPermissionMatrixProps) => {
  const { t, i18n } = useTranslation()
  const {
    permissions,
    structuredPermissions,
    modules,
    moduleInfo,
    loading,
    fetchPermissions,
    getDisplayName,
    getModuleDisplayName
  } = usePermissionStore()

  const [expandedModules, setExpandedModules] = useState<string[]>([])

  // Load permissions on component mount
  useEffect(() => {
    if (permissions.length === 0 && !loading) {
      fetchPermissions()
    }
  }, [permissions.length, loading, fetchPermissions])

  // Expand all modules by default when permissions are loaded
  useEffect(() => {
    if (modules.length > 0 && expandedModules.length === 0) {
      setExpandedModules(modules)
    }
  }, [modules, expandedModules.length])

  const handlePermissionToggle = (permissionId: string) => {
    if (disabled) return

    const currentIds = [...selectedPermissionIds]
    const index = currentIds.indexOf(permissionId)

    if (index > -1) {
      currentIds.splice(index, 1)
    } else {
      currentIds.push(permissionId)
    }

    onPermissionChange(currentIds)
  }

  const handleModuleToggle = (module: string) => {
    if (disabled) return

    const modulePermissions = structuredPermissions[module]?.permissions || []
    const modulePermissionIds = modulePermissions.map(p => p.id)
    const currentIds = [...selectedPermissionIds]

    // Check if all module permissions are selected
    const allSelected = modulePermissionIds.every(id => currentIds.includes(id))

    if (allSelected) {
      // Remove all module permissions
      const newIds = currentIds.filter(id => !modulePermissionIds.includes(id))
      onPermissionChange(newIds)
    } else {
      // Add all module permissions
      const newIds = [...currentIds]
      modulePermissionIds.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id)
        }
      })
      onPermissionChange(newIds)
    }
  }

  const handleFullAccessToggle = (checked: boolean) => {
    if (disabled) return

    onFullAccessChange(checked)

    if (checked) {
      // Select all permissions
      onPermissionChange(permissions.map(p => p.id))
    } else {
      // Clear all permissions
      onPermissionChange([])
    }
  }

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = structuredPermissions[module]?.permissions || []
    const modulePermissionIds = modulePermissions.map(p => p.id)
    return modulePermissionIds.every(id => selectedPermissionIds.includes(id))
  }

  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = structuredPermissions[module]?.permissions || []
    const modulePermissionIds = modulePermissions.map(p => p.id)
    const selectedCount = modulePermissionIds.filter(id => selectedPermissionIds.includes(id)).length
    return selectedCount > 0 && selectedCount < modulePermissionIds.length
  }

  const handleAccordionToggle = (module: string) => {
    const isExpanded = expandedModules.includes(module)
    if (isExpanded) {
      setExpandedModules(expandedModules.filter(m => m !== module))
    } else {
      setExpandedModules([...expandedModules, module])
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>{t('Loading permissions...')}</Typography>
      </Box>
    )
  }

  return (
    <Fragment>
      <Typography variant='h6' sx={{ mb: 2 }}>
        {t('Role Permissions')}
      </Typography>

      {/* Full Access Toggle */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              {t('Full System Access')}
            </Typography>
            <Tooltip title={t('Grants complete access to all system features and modules')}>
              <Box sx={{ display: 'flex', ml: 1 }}>
                <InfoIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
            </Tooltip>
          </Box>
          <Switch
            checked={hasFullAccess}
            onChange={e => handleFullAccessToggle(e.target.checked)}
            disabled={disabled}
          />
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          {t('When enabled, this role will have access to all current and future features')}
        </Typography>
      </Box>

      {!hasFullAccess && (
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.secondary' }}>
            {t('Configure specific permissions for this role:')}
          </Typography>

          {modules.map(module => (
            <Accordion
              key={module}
              expanded={expandedModules.includes(module)}
              onChange={() => handleAccordionToggle(module)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Checkbox
                    checked={isModuleFullySelected(module)}
                    indeterminate={isModulePartiallySelected(module)}
                    onChange={() => handleModuleToggle(module)}
                    disabled={disabled}
                    onClick={e => e.stopPropagation()}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {t(module)}
                    </Typography>
                    <Tooltip title={t(`${module}-description`)}>
                      <Box sx={{ display: 'flex', ml: 1 }}>
                        <InfoIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant='body2' color='text.secondary'>
                    {structuredPermissions[module]?.permissions?.filter(p => selectedPermissionIds.includes(p.id))
                      .length || 0}{' '}
                    / {structuredPermissions[module]?.permissions?.length || 0}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {(structuredPermissions[module]?.permissions || []).map(permission => (
                    <FormControlLabel
                      key={permission.id}
                      control={
                        <Checkbox
                          size='small'
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          disabled={disabled}
                        />
                      }
                      label={
                        <Tooltip title={t(permission.name)}>
                          <Typography variant='body2'>{t(permission.name)}</Typography>
                        </Tooltip>
                      }
                      sx={{ minWidth: 200, m: 0 }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          {hasFullAccess
            ? t('All permissions granted via full access')
            : `${selectedPermissionIds.length} ${t('of')} ${permissions.length} ${t('permissions selected')}`}
        </Typography>
      </Box>
    </Fragment>
  )
}

export default EnhancedPermissionMatrix
