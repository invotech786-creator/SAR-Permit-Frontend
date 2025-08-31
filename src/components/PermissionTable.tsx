// ** React Imports
import { Fragment } from 'react'

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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Constants & Utils
import { getActionsForResource, ACTION_LABELS } from 'src/constants/permissionActions'
import { hasPermissionInFormat } from 'src/utils/permissionConverter'

interface PermissionTableProps {
  categories: { [category: string]: string }
  selectedPermissions: { [category: string]: { [action: string]: boolean } }
  fullAccess: boolean
  onTogglePermission: (category: string, action: string) => void
  onToggleFullAccess: (checked: boolean) => void
}

const PermissionTable = ({
  categories,
  selectedPermissions,
  fullAccess,
  onTogglePermission,
  onToggleFullAccess
}: PermissionTableProps) => {
  const { t } = useTranslation()
  return (
    <Fragment>
      <Typography variant='h6'>{t('Role Permissions')}</Typography>
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: '0 !important' }}>
                <Box
                  sx={{
                    display: 'flex',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    alignItems: 'center',
                    textTransform: 'capitalize',
                    '& svg': { ml: 1, cursor: 'pointer' }
                  }}
                >
                  {t('Administrator Access')}
                  <Tooltip placement='top' title={t('Allows full access to the system')}>
                    <Box sx={{ display: 'flex' }}>
                      <Icon icon='tabler:info-circle' fontSize='1.25rem' />
                    </Box>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell colSpan={6}>
                <FormControlLabel
                  label={t('Full Access')}
                  sx={{ '& .MuiTypography-root': { textTransform: 'capitalize' } }}
                  control={
                    <Checkbox
                      size='small'
                      checked={fullAccess}
                      onChange={(e) => onToggleFullAccess(e.target.checked)}
                    />
                  }
                />
              </TableCell>
            </TableRow>
          </TableHead>
          {!fullAccess && (
            <TableBody>
              {Object.entries(categories).map(([category, label]) => {
                const availableActions = getActionsForResource(category)
                
                return (
                  <TableRow key={category} sx={{ '& .MuiTableCell-root:first-of-type': { pl: '0 !important' } }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        color: theme => `${theme.palette.text.primary} !important`
                      }}
                    >
                      {label}
                    </TableCell>
                    {availableActions.map((action) => (
                      <TableCell key={action}>
                        <FormControlLabel
                          label={ACTION_LABELS[action] || action}
                          control={
                            <Checkbox
                              size='small'
                              checked={hasPermissionInFormat(selectedPermissions, category, action)}
                              onChange={() => onTogglePermission(category, action)}
                            />
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Fragment>
  )
}

export default PermissionTable