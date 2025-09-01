import { useState, useEffect } from 'react'
import { Card, Typography, Box, Grid, IconButton, Menu, MenuItem } from '@mui/material'
import FallbackSpinner from 'src/@core/components/spinner'
import Icon from 'src/@core/components/icon'
import { useDepartmentStore } from 'src/store'
import DepartmentModal from './components/DepartmentModal'
import DepartmentHistoryModal from './components/DepartmentHistoryModal'
import DepartmentSequenceModal from './components/DepartmentSequenceModal'
import TableHeader from 'src/views/apps/department/list/TableHeader'
import ConfirmationModal from 'src/components/ConfirmationModal'
import { DataGrid, GridSelectionModel, getGridStringOperators } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import { IDepartment } from 'src/types'
import { usePermission } from 'src/utils/permissions'

const safeString = (value: any, t: any): string => {
  if (value === null || value === undefined) return t('N/A')
  if (typeof value === 'object') {
    if (value.nameEn) return String(value.nameEn)
    if (value.nameAr) return String(value.nameAr)
    if (value.name) return String(value.name)
    if (value.username) return String(value.username)

    return t('N/A')
  }

  return String(value)
}

const getCurrentLocale = (i18n?: any) => {
  return i18n?.language || 'en'
}

const renderDepartmentAvatar = (row: any, i18n?: any, t?: any) => {
  const locale = getCurrentLocale(i18n)
  const displayName = locale === 'ar' ? safeString(row.nameAr || row.name, t) : safeString(row.nameEn || row.name, t)

  return (
    <CustomAvatar
      skin='light'
      color='primary'
      sx={{ mr: 2.5, width: 38, height: 38, fontSize: '1rem', fontWeight: 500 }}
    >
      {getInitials(displayName)}
    </CustomAvatar>
  )
}

const RowOptions = ({ id, onEdit, onView, onDelete, onHistory, t, isRTL }: any) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)
  const { canAccess, canUpdate, canDelete, canViewHistory } = usePermission()

  const handleRowOptionsClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = () => {
    onDelete(id)
    handleRowOptionsClose()
  }

  const handleView = () => {
    onView(id)
  }

  const handleEdit = () => {
    onEdit(id)
  }

  const handleHistory = () => {
    onHistory(id)
    handleRowOptionsClose()
  }

  // Check if user has view, update, or delete permissions for departments
  const canViewDepartment = canAccess('department-management')
  const canEditDepartment = canUpdate('department-management')
  const canDeleteDepartment = canDelete('department-management')
  const canViewDepartmentHistory = canViewHistory('department-management')

  // Don't render anything if user has no permissions
  if (!canViewDepartment && !canEditDepartment && !canDeleteDepartment && !canViewDepartmentHistory) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
      {canViewDepartment && <Icon icon='tabler:eye' fontSize={20} onClick={handleView} style={{ cursor: 'pointer' }} />}
      {canEditDepartment && (
        <Icon icon='tabler:edit' fontSize={20} onClick={handleEdit} style={{ cursor: 'pointer' }} />
      )}
      {(canDeleteDepartment || canViewDepartment) && (
        <>
          <IconButton size='small' onClick={handleRowOptionsClick}>
            <Icon icon='tabler:dots-vertical' />
          </IconButton>
          <Menu
            keepMounted
            anchorEl={anchorEl}
            open={rowOptionsOpen}
            onClose={handleRowOptionsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: isRTL ? 'left' : 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: isRTL ? 'left' : 'right'
            }}
            PaperProps={{ style: { minWidth: '8rem' } }}
          >
            {canDeleteDepartment && (
              <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
                <Icon icon='tabler:trash' fontSize={20} />
                {t('Delete')}
              </MenuItem>
            )}
            {canViewDepartmentHistory && (
              <MenuItem onClick={handleHistory} sx={{ '& svg': { mr: 2 } }}>
                <Icon icon='tabler:history' fontSize={20} />
                {t('History')}
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  )
}

const Departments = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { canAccess, canCreate, canUpdate, canDelete, canViewHistory } = usePermission()

  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showSequenceModal, setShowSequenceModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | undefined>(undefined)
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'Add' | 'Edit' | 'View'>('Add')
  const [pageSize, setPageSize] = useState(10)
  const [trigger, setTrigger] = useState(false)

  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([])
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  const {
    getDepartments,
    departments = [],
    deleteDepartment,
    deleteBulkDepartments,
    toggleBulkDepartmentsActivity,
    loading
  } = useDepartmentStore()

  useEffect(() => {
    getDepartments()
  }, [getDepartments])

  const handleBulkDelete = async () => {
    try {
      if (!canDeleteDepartment || selectedRows.length === 0) {
        return
      }

      setShowBulkDeleteModal(true)
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      if (!canDeleteDepartment) return
      const success = await deleteBulkDepartments(selectedRows as string[])
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
        setShowBulkDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting departments:', error)
    }
  }

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({})
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    try {
      if (!canUpdateDepartment || selectedRows.length === 0) {
        return
      }

      const statusBoolean = status === 'active'
      const success = await toggleBulkDepartmentsActivity(selectedRows as string[], statusBoolean)
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
      }
    } catch (error) {
      console.error(`Error updating departments status to ${status}:`, error)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'Delete':
        if (canDeleteDepartment) handleBulkDelete()
        break
      case 'Active':
        if (canUpdateDepartment) handleBulkStatusChange('active')
        break
      case 'Inactive':
        if (canUpdateDepartment) handleBulkStatusChange('inactive')
        break
      default:
        break
    }
  }

  // Check permissions for departments
  const canViewDepartment = canAccess('department-management')
  const canCreateDepartment = canCreate('department-management')
  const canUpdateDepartment = canUpdate('department-management')
  const canDeleteDepartment = canDelete('department-management')
  const canViewDepartmentHistory = canViewHistory('department-management')

  // ** Handlers
  const toggleAddDepartmentDrawer = () => {
    if (!canCreateDepartment) return
    setModalMode('Add')
    setSelectedDepartment(undefined)
    setShowDepartmentModal(!showDepartmentModal)
  }

  const closeDepartmentModal = () => {
    setShowDepartmentModal(false)
  }

  const handleEditDepartment = (departmentId: any) => {
    if (!canUpdateDepartment) return
    const department = departments.find(c => c._id === departmentId)
    setSelectedDepartment(department)
    setModalMode('Edit')
    setShowDepartmentModal(true)
  }

  const handleViewDepartment = (departmentId: any) => {
    if (!canViewDepartment) return
    const department = departments.find(c => c._id === departmentId)
    setSelectedDepartment(department)
    setModalMode('View')
    setShowDepartmentModal(true)
  }

  const handleDeleteDepartment = (departmentId: any) => {
    if (!canDeleteDepartment) return
    setDepartmentToDelete(departmentId)
    // Check if this department is selected in the DataGrid
    const isSelected = selectedRows.includes(departmentId)
    // If department is selected, show bulk delete modal, otherwise show single delete modal
    if (isSelected) {
      setShowBulkDeleteModal(true)
    } else {
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteDepartment = async () => {
    try {
      if (departmentToDelete && canDeleteDepartment) {
        await deleteDepartment(departmentToDelete)
        setTrigger(!trigger)
        setShowDeleteModal(false)
        setDepartmentToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting department:', error)
    }
  }

  const handleViewHistory = (departmentId: any) => {
    if (!canViewDepartmentHistory) return
    const department = departments.find(c => c._id === departmentId)
    setSelectedDepartment(department)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
  }

  const safeDepartments = Array.isArray(departments) ? departments : []

  const formatDate = (dateString: any) => {
    if (!dateString) return t('N/A')
    try {
      const currentLang = i18n.language
      const isArabic = currentLang === 'ar'
      return new Date(dateString).toLocaleDateString(isArabic ? 'ar-SA' : 'en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return t('N/A')
    }
  }

  const columns = [
    {
      flex: 0.4,
      minWidth: 250,
      field: 'name',
      headerName: t('Name'),
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: ({ row }: any) => {
        const locale = getCurrentLocale(i18n)
        return locale === 'ar' ? safeString(row.nameAr || row.name, t) : safeString(row.nameEn || row.name, t)
      },
      renderCell: ({ row }: any) => {
        const locale = getCurrentLocale(i18n)
        const displayName =
          locale === 'ar' ? safeString(row.nameAr || row.name, t) : safeString(row.nameEn || row.name, t)

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            {renderDepartmentAvatar(row, i18n, t)}
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                cursor: 'pointer'
              }}
              onClick={() => handleViewDepartment(row._id)}
            >
              {displayName}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'createdBy',
      headerName: t('Created By'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the createdBy name for filtering
        let createdBy = t('System')

        if (typeof row.createdBy === 'object' && row.createdBy !== null) {
          const locale = getCurrentLocale(i18n)
          createdBy =
            locale === 'ar'
              ? row.createdBy.nameAr || row.createdBy.name || row.createdBy.username || t('System')
              : row.createdBy.nameEn || row.createdBy.name || row.createdBy.username || t('System')
        } else if (row.createdBy) {
          createdBy = safeString(row.createdBy, t)
        }

        return createdBy
      },
      renderCell: ({ row }: any) => {
        let createdBy = t('System')

        if (typeof row.createdBy === 'object' && row.createdBy !== null) {
          const locale = getCurrentLocale(i18n)
          createdBy =
            locale === 'ar'
              ? row.createdBy.nameAr || row.createdBy.name || row.createdBy.username || t('System')
              : row.createdBy.nameEn || row.createdBy.name || row.createdBy.username || t('System')
        } else if (row.createdBy) {
          createdBy = safeString(row.createdBy, t)
        }

        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {createdBy}
          </Typography>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'status',
      headerName: t('Status'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        return row.isActive ? t('Active') : t('Inactive')
      },
      renderCell: ({ row }: any) => {
        const isActive = row.isActive === true

        return (
          <CustomChip
            rounded
            skin='light'
            size='small'
            label={isActive ? t('Active') : t('Inactive')}
            color={isActive ? 'success' : 'secondary'}
            sx={{ textTransform: 'capitalize' }}
          />
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'createdAt',
      headerName: t('Created At'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the formatted date for filtering to match what's displayed
        return formatDate(row.createdAt)
      },
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {formatDate(row.createdAt)}
          </Typography>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerName: t('Actions'),
      renderCell: ({ row }: any) => (
        <RowOptions
          id={row._id}
          onEdit={handleEditDepartment}
          onView={handleViewDepartment}
          onDelete={handleDeleteDepartment}
          onHistory={handleViewHistory}
          t={t}
          isRTL={isRTL}
        />
      )
    }
  ]

  if (loading) {
    return <FallbackSpinner />
  }

  // Check if user has permission to view departments
  if (!canViewDepartment) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          {t('Access denied - Insufficient permissions')}
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Main Content */}
      <Grid item xs={12}>
        <Card>
          <TableHeader
            selectedRows={selectedRows}
            toggle={toggleAddDepartmentDrawer}
            onBulkAction={handleBulkAction}
            onShowAllColumns={
              Object.keys(columnVisibilityModel).some(key => !columnVisibilityModel[key])
                ? handleShowAllColumns
                : undefined
            }
            canCreate={canCreateDepartment}
            canUpdate={canUpdateDepartment}
            canDelete={canDeleteDepartment}
            onSequenceUpdate={() => setShowSequenceModal(true)}
          />

          <DataGrid
            autoHeight
            pagination
            rowHeight={62}
            rows={safeDepartments}
            columns={columns}
            checkboxSelection
            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onSelectionModelChange={rows => setSelectedRows(rows)}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            getRowId={row => row._id}
            loading={loading}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            disableColumnMenu={false}
            localeText={{
              noRowsLabel: t('No Records Found'),
              MuiTablePagination: {
                labelRowsPerPage: t('Rows per page:'),
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}-${to} ${t('of')} ${count !== -1 ? count : `more than ${to}`}`
              }
            }}
          />
        </Card>
      </Grid>

      {/* Department Modal */}
      <DepartmentModal
        mode={modalMode}
        open={showDepartmentModal}
        department={selectedDepartment}
        toggle={closeDepartmentModal}
      />

      {/* Department History Modal */}
      <DepartmentHistoryModal
        open={showHistoryModal}
        toggle={closeHistoryModal}
        departmentId={selectedDepartment?._id || ''}
        departmentName={selectedDepartment?.nameEn || selectedDepartment?.nameAr || ''}
      />

      {/* Single Department Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={t('Delete Department')}
        description={t('Are you sure you want to delete this department? This action cannot be undone.')}
        btnName={t('Delete')}
        onClick={confirmDeleteDepartment}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={showBulkDeleteModal}
        toggle={() => setShowBulkDeleteModal(false)}
        mode={t('Delete Departments')}
        description={t('Are you sure you want to delete %s department(s)? This action cannot be undone.').replace(
          '%s',
          selectedRows.length.toString()
        )}
        btnName={selectedRows.length === 1 ? t('Delete') : t('Delete All')}
        onClick={confirmBulkDelete}
      />

      {/* Department Sequence Modal */}
      <DepartmentSequenceModal
        open={showSequenceModal}
        toggle={() => setShowSequenceModal(false)}
        departments={departments}
        onSequenceUpdate={updatedDepartments => {
          // Refresh the departments list to show updated sequence
          setTrigger(!trigger)
        }}
      />
    </Grid>
  )
}

Departments.acl = {
  subject: 'department-management',
  action: 'view'
}

export default Departments
