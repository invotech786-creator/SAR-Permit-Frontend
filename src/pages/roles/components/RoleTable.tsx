// ** React Imports
import { useCallback, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { DataGrid, getGridStringOperators } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { SelectChangeEvent } from '@mui/material/Select'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { getRoleDisplayName, getRoleDescription } from 'src/utils/multilingual'

// ** Types Imports
import { IRole } from 'src/types/role'
import { ThemeColor } from 'src/@core/layouts/types'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/roles/list/TableHeader'
import EditRoleModal from './EditRoleModal'
import RoleHistoryModal from './RoleHistoryModal'
import ConfirmationModal from 'src/components/ConfirmationModal'

// ** Store Imports
import useRoleStore from 'src/store/useRoleStore'
import useAuthStore from 'src/store/useAuthStore'
import { showErrorMessage } from 'src/components'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

interface RoleTableProps {
  roles: IRole[]
  loading?: boolean
  pagination?: {
    current: number
    pages: number
    total: number
  }
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onEditRole?: (role: IRole) => void
  onViewRole?: (role: IRole) => void
  onViewHistory?: (role: IRole) => void
}

interface CellType {
  row: IRole
}

// ** Vars
const roleStatusObj: { [key: string]: ThemeColor } = {
  active: 'success',
  inactive: 'secondary'
}

const RoleTable = ({
  roles,
  loading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onEditRole,
  onViewRole,
  onViewHistory
}: RoleTableProps) => {
  const { t, i18n } = useTranslation()
  const {
    deleteRole,
    bulkDeleteRoles,
    bulkToggleRoles,
    assignUsersToRole,
    removeUsersFromRole,
    getUsersByRole,
    loading: storeLoading
  } = useRoleStore()

  const { hasPermission } = useAuthStore()

  // ** States
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<IRole | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyRole, setHistoryRole] = useState<IRole | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedRows.length === 0) {
        showErrorMessage(t('Please select roles to perform this action'))
        return
      }

      try {
        switch (action) {
          case 'Delete':
            if (!hasPermission('role-management', 'delete')) {
              showErrorMessage(t('You do not have permission to delete roles'))
              return
            }
            setShowBulkDeleteModal(true)
            break
          case 'Active':
            if (!hasPermission('role-management', 'toggle-activity')) {
              showErrorMessage(t('You do not have permission to change role status'))
              return
            }
            await bulkToggleRoles(selectedRows, true)
            setSelectedRows([])
            break
          case 'Inactive':
            if (!hasPermission('role-management', 'toggle-activity')) {
              showErrorMessage(t('You do not have permission to change role status'))
              return
            }
            await bulkToggleRoles(selectedRows, false)
            setSelectedRows([])
            break
          default:
            break
        }
      } catch (error) {
        console.error('Error in bulk action:', error)
      }
    },
    [selectedRows, t, bulkToggleRoles, hasPermission]
  )

  const handleDeleteRole = (role: IRole) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      await deleteRole(roleToDelete._id as string)
      setShowDeleteModal(false)
      setRoleToDelete(null)
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteRoles(selectedRows)
      setSelectedRows([])
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({})
  }

  const handleEditRole = (role: IRole) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  const handleViewRole = (role: IRole) => {
    if (onViewRole) {
      onViewRole(role)
    } else {
      // Fallback: open view dialog or navigate to view page
      console.log('View role:', role)
    }
  }

  const handleViewHistory = (role: IRole) => {
    if (onViewHistory) {
      onViewHistory(role)
    } else {
      // Fallback: show local history modal
      setHistoryRole(role)
      setShowHistoryModal(true)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, role: IRole) => {
    setAnchorEl(event.currentTarget)
    setSelectedRole(role)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRole(null)
  }

  const handleMenuAction = (action: string) => {
    if (!selectedRole) return

    switch (action) {
      case 'delete':
        handleDeleteRole(selectedRole)
        break
      case 'history':
        handleViewHistory(selectedRole)
        break
      default:
        break
    }
    handleMenuClose()
  }

  const handleEditModalClose = () => {
    setShowEditModal(false)
    setEditingRole(null)
  }

  const handleHistoryModalClose = () => {
    setShowHistoryModal(false)
    setHistoryRole(null)
  }

  const handleEditModalSave = (updatedRole: IRole) => {
    // Refresh the roles list or update the specific role
    console.log('Role updated:', updatedRole)
    handleEditModalClose()
  }

  const columns = [
    {
      flex: 0.4,
      minWidth: 280,
      field: 'nameEn',
      headerName: t('Role'),
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: params => {
        // Use the current language name for sorting
        return getRoleDisplayName(params.row, i18n.language)
      },
      renderCell: ({ row }: CellType) => {
        return (
          <Typography
            noWrap
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': { color: 'primary.main' },
              cursor: 'pointer'
            }}
            onClick={() => handleViewRole(row)}
          >
            {getRoleDisplayName(row, i18n.language)}
          </Typography>
        )
      }
    },
    {
      flex: 0.4,
      minWidth: 200,
      headerName: t('Description'),
      field: 'descriptionEn',
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: params => {
        // Use the current language description for sorting
        return getRoleDescription(params.row, i18n.language)
      },
      renderCell: ({ row }: CellType) => (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {getRoleDescription(row, i18n.language) || t('No description')}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'isActive',
      headerName: t('Status'),
      sortable: true,
      filterable: true,
      renderCell: ({ row }: CellType) => (
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={row.isActive ? t('Active') : t('Inactive')}
          color={roleStatusObj[row.isActive ? 'active' : 'inactive']}
          sx={{
            textTransform: 'capitalize',
            fontWeight: 500
          }}
        />
      )
    },
    {
      flex: 0.2,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: t('Actions'),
      renderCell: ({ row }: CellType) => {
        const canViewRole = hasPermission('role-management', 'view')
        const canEditRole = hasPermission('role-management', 'update')
        const canDeleteRole = hasPermission('role-management', 'delete')

        return (
          <Box sx={{ display: 'flex' }}>
            <IconButton
              size='small'
              sx={{
                color: canViewRole ? 'text.primary' : 'text.disabled',
                '&:hover': canViewRole ? { color: 'primary.main' } : {}
              }}
              onClick={() => canViewRole && handleViewRole(row)}
              disabled={!canViewRole}
              title={t('View Role')}
            >
              <Icon icon='tabler:eye' />
            </IconButton>
            <IconButton
              size='small'
              sx={{
                color: canEditRole ? 'text.primary' : 'text.disabled',
                '&:hover': canEditRole ? { color: 'primary.main' } : {}
              }}
              onClick={() => canEditRole && handleEditRole(row)}
              disabled={!canEditRole}
              title={t('Edit Role')}
            >
              <Icon icon='tabler:edit' />
            </IconButton>
            <IconButton
              size='small'
              sx={{
                color: canDeleteRole ? 'text.primary' : 'text.disabled',
                '&:hover': canDeleteRole ? { color: 'primary.main' } : {}
              }}
              onClick={e => canDeleteRole && handleMenuOpen(e, row)}
              disabled={!canDeleteRole}
              title={t('More Options')}
            >
              <Icon icon='tabler:dots-vertical' />
            </IconButton>
          </Box>
        )
      }
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableHeader
            selectedRows={selectedRows}
            onBulkAction={handleBulkAction}
            loading={storeLoading}
            canDelete={hasPermission('role-management', 'delete')}
            canToggleStatus={hasPermission('role-management', 'toggle-activity')}
            onShowAllColumns={
              Object.keys(columnVisibilityModel).some(key => !columnVisibilityModel[key])
                ? handleShowAllColumns
                : undefined
            }
          />
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={roles}
            columns={columns}
            checkboxSelection
            pageSize={paginationModel.pageSize}
            disableSelectionOnClick
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={newPage => {
              setPaginationModel(prev => ({ ...prev, page: newPage }))
              onPageChange?.(newPage)
            }}
            onPageSizeChange={newPageSize => {
              setPaginationModel(prev => ({ ...prev, pageSize: newPageSize }))
              onPageSizeChange?.(newPageSize)
            }}
            onSelectionModelChange={(rows: any) => setSelectedRows(rows as string[])}
            getRowId={row => row._id as string}
            loading={storeLoading}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
            localeText={{
              noRowsLabel: t('No Records Found'),
              MuiTablePagination: {
                labelRowsPerPage: t('Rows per page:'),
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}-${to} ${t('of')} ${count !== -1 ? count : `more than ${to}`}`
              },
              // Column actions localization
              columnMenuLabel: t('Menu'),
              columnMenuShowColumns: t('Show columns'),
              columnMenuFilter: t('Filter'),
              columnMenuHideColumn: t('Hide'),
              columnMenuUnsort: t('Unsort'),
              columnMenuSortAsc: t('Sort by ASC'),
              columnMenuSortDesc: t('Sort by DESC'),
              // Filter panel localization
              filterPanelAddFilter: t('Add filter'),
              filterPanelDeleteIconLabel: t('Delete filter'),
              filterPanelOperators: t('Operator'),
              filterPanelOperatorAnd: t('And'),
              filterPanelOperatorOr: t('Or'),
              filterPanelColumns: t('Columns'),
              filterPanelInputLabel: t('Value'),
              filterPanelInputPlaceholder: t('Filter value'),
              // Filter operator labels
              filterOperatorContains: t('contains'),
              filterOperatorEquals: t('equals'),
              filterOperatorStartsWith: t('starts with'),
              filterOperatorEndsWith: t('ends with'),
              filterOperatorIsEmpty: t('is empty'),
              filterOperatorIsNotEmpty: t('is not empty'),
              filterOperatorIsAnyOf: t('is any of'),
              // Column visibility
              columnsPanelTextFieldLabel: t('Find column'),
              columnsPanelTextFieldPlaceholder: t('Column title...'),
              columnsPanelDragIconLabel: t('Reorder column'),
              columnsPanelShowAllButton: t('Show all'),
              columnsPanelHideAllButton: t('Hide all')
            }}
          />
        </Card>
      </Grid>

      {/* Menu for additional actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <Icon icon='tabler:trash' style={{ marginRight: 8 }} />
          {t('Delete')}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('history')}>
          <Icon icon='tabler:history' style={{ marginRight: 8 }} />
          {t('History')}
        </MenuItem>
      </Menu>

      {/* Edit Role Modal */}
      <EditRoleModal
        open={showEditModal}
        role={editingRole}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
      />

      {/* Role History Modal */}
      <RoleHistoryModal
        open={showHistoryModal}
        toggle={handleHistoryModalClose}
        roleId={historyRole?._id || ''}
        roleName={historyRole ? getRoleDisplayName(historyRole, i18n.language) : ''}
      />

      {/* Single Role Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={t('Delete Role')}
        description={`${t('Are you sure you want to delete the role')} "${
          roleToDelete ? getRoleDisplayName(roleToDelete, i18n.language) : ''
        }"? ${t('This action cannot be undone.')}`}
        btnName={t('Delete')}
        onClick={confirmDeleteRole}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={showBulkDeleteModal}
        toggle={() => setShowBulkDeleteModal(false)}
        mode={t('Delete Roles')}
        description={`${t('Are you sure you want to delete')} ${selectedRows.length} ${t(
          'role(s)? This action cannot be undone.'
        )}`}
        btnName={t('Delete All')}
        onClick={confirmBulkDelete}
      />
    </Grid>
  )
}

export default RoleTable
