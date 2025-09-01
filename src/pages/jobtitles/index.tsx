import { useState, useEffect } from 'react'
import { Card, Typography, Box, Grid, IconButton, Menu, MenuItem } from '@mui/material'
import FallbackSpinner from 'src/@core/components/spinner'
import Icon from 'src/@core/components/icon'
import { useJobTitleStore } from 'src/store'
import JobTitleModal from './components/JobTitleModal'
import JobTitleHistoryModal from './components/JobTitleHistoryModal'
import TableHeader from 'src/views/apps/jobtitle/list/TableHeader'
import ConfirmationModal from 'src/components/ConfirmationModal'
import { DataGrid, GridSelectionModel, getGridStringOperators } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { usePermission } from 'src/utils/permissions'
import CustomChip from 'src/@core/components/mui/chip'

import { IJobTitle } from 'src/types'

// ** Helper function to safely convert value to string
const safeString = (value: any): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') {
    if (value.nameEn) return String(value.nameEn)
    if (value.nameAr) return String(value.nameAr)
    if (value.name) return String(value.name)
    if (value.username) return String(value.username)

    return 'N/A'
  }

  return String(value)
}

const getCurrentLocale = (i18n?: any) => {
  return i18n?.language || 'en'
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

  // Check if user has permissions for job titles
  const canViewJobTitle = canAccess('job-title-management')
  const canEditJobTitle = canUpdate('job-title-management')
  const canDeleteJobTitle = canDelete('job-title-management')
  const canViewJobTitleHistory = canViewHistory('job-title-management')

  // Don't render anything if user has no permissions
  if (!canViewJobTitle && !canEditJobTitle && !canDeleteJobTitle && !canViewJobTitleHistory) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
      {canViewJobTitle && <Icon icon='tabler:eye' fontSize={20} onClick={handleView} style={{ cursor: 'pointer' }} />}
      {canEditJobTitle && <Icon icon='tabler:edit' fontSize={20} onClick={handleEdit} style={{ cursor: 'pointer' }} />}
      {(canDeleteJobTitle || canViewJobTitle) && (
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
            {canDeleteJobTitle && (
              <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 } }}>
                <Icon icon='tabler:trash' fontSize={20} />
                {t('Delete')}
              </MenuItem>
            )}
            {canViewJobTitleHistory && (
              <MenuItem onClick={handleHistory} sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 } }}>
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

const JobTitles = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { canAccess, canCreate, canUpdate, canDelete, canViewHistory } = usePermission()

  // ** State
  const [showJobTitleModal, setShowJobTitleModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedJobTitle, setSelectedJobTitle] = useState<IJobTitle | undefined>(undefined)
  const [jobTitleToDelete, setJobTitleToDelete] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'Add' | 'Edit' | 'View'>('Add')
  const [pageSize, setPageSize] = useState(10)
  const [trigger, setTrigger] = useState(false)

  // Remove the local loading state since we'll use the store's loading state
  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([])
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  // ** Store hooks
  const {
    getJobTitles,
    jobTitles = [],
    deleteJobTitle,
    deleteBulkJobTitles,
    toggleBulkJobTitlesActivity,
    loading
  } = useJobTitleStore()

  // ** Effects - Direct API calls to avoid dependency issues
  useEffect(() => {
    getJobTitles()
  }, [getJobTitles])

  // ** Bulk action handlers
  const handleBulkDelete = async () => {
    try {
      if (!canDeleteJobTitle || selectedRows.length === 0) {
        return
      }

      setShowBulkDeleteModal(true)
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      if (!canDeleteJobTitle) return
      const success = await deleteBulkJobTitles(selectedRows as string[])
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
        setShowBulkDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting job titles:', error)
    }
  }

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({})
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    try {
      if (!canUpdateJobTitle || selectedRows.length === 0) {
        return
      }

      const statusBoolean = status === 'active'
      const success = await toggleBulkJobTitlesActivity(selectedRows as string[], statusBoolean)
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
      }
    } catch (error) {
      console.error(`Error updating job titles status to ${status}:`, error)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'Delete':
        if (canDeleteJobTitle) handleBulkDelete()
        break
      case 'Active':
        if (canUpdateJobTitle) handleBulkStatusChange('active')
        break
      case 'Inactive':
        if (canUpdateJobTitle) handleBulkStatusChange('inactive')
        break
      default:
        break
    }
  }

  // Check permissions for job titles
  const canViewJobTitle = canAccess('job-title-management')
  const canCreateJobTitle = canCreate('job-title-management')
  const canUpdateJobTitle = canUpdate('job-title-management')
  const canDeleteJobTitle = canDelete('job-title-management')
  const canViewJobTitleHistory = canViewHistory('job-title-management')

  // ** Handlers
  const toggleAddJobTitleDrawer = () => {
    if (!canCreateJobTitle) return
    setModalMode('Add')
    setSelectedJobTitle(undefined)
    setShowJobTitleModal(!showJobTitleModal)
  }

  const closeJobTitleModal = () => {
    setShowJobTitleModal(false)
  }

  const handleEditJobTitle = (jobTitleId: any) => {
    if (!canUpdateJobTitle) return
    const jobTitle = jobTitles.find(j => j._id === jobTitleId)
    setSelectedJobTitle(jobTitle)
    setModalMode('Edit')
    setShowJobTitleModal(true)
  }

  const handleViewJobTitle = (jobTitleId: any) => {
    if (!canViewJobTitle) return
    const jobTitle = jobTitles.find(j => j._id === jobTitleId)
    setSelectedJobTitle(jobTitle)
    setModalMode('View')
    setShowJobTitleModal(true)
  }

  const handleDeleteJobTitle = (jobTitleId: any) => {
    if (!canDeleteJobTitle) return
    setJobTitleToDelete(jobTitleId)
    // Check if this job title is selected in the DataGrid
    const isSelected = selectedRows.includes(jobTitleId)
    // If job title is selected, show bulk delete modal, otherwise show single delete modal
    if (isSelected) {
      setShowBulkDeleteModal(true)
    } else {
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteJobTitle = async () => {
    try {
      if (jobTitleToDelete && canDeleteJobTitle) {
        await deleteJobTitle(jobTitleToDelete)
        setTrigger(!trigger)
        setShowDeleteModal(false)
        setJobTitleToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting job title:', error)
    }
  }

  const handleViewHistory = (jobTitleId: any) => {
    if (!canViewJobTitleHistory) return
    const jobTitle = jobTitles.find(j => j._id === jobTitleId)
    setSelectedJobTitle(jobTitle)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
  }

  // ** Safe data access
  const safeJobTitles = Array.isArray(jobTitles) ? jobTitles : []

  // ** Format date helper
  const formatDate = (dateString: any) => {
    if (!dateString) return t('N/A')
    try {
      return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return t('N/A')
    }
  }

  // ** Column definitions - Only Name, Created By, Created At, Actions
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
        // Use the bilingual name for sorting
        const locale = getCurrentLocale(i18n)
        return locale === 'ar' ? safeString(row.nameAr || row.name) : safeString(row.nameEn || row.name)
      },
      renderCell: ({ row }: any) => {
        const locale = getCurrentLocale(i18n)
        const displayName = locale === 'ar' ? safeString(row.nameAr || row.name) : safeString(row.nameEn || row.name)

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                cursor: 'pointer'
              }}
              onClick={() => handleViewJobTitle(row._id)}
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
        // Use the createdBy name for sorting
        let createdBy = t('System')

        if (typeof row.createdBy === 'object' && row.createdBy !== null) {
          const locale = getCurrentLocale(i18n)
          createdBy =
            locale === 'ar'
              ? row.createdBy.nameAr || row.createdBy.name || row.createdBy.username || t('System')
              : row.createdBy.nameEn || row.createdBy.name || row.createdBy.username || t('System')
        } else if (row.createdBy) {
          createdBy = safeString(row.createdBy)
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
          createdBy = safeString(row.createdBy)
        }

        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {createdBy}
          </Typography>
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
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerName: t('Actions'),
      renderCell: ({ row }: any) => (
        <RowOptions
          id={row._id}
          onEdit={handleEditJobTitle}
          onView={handleViewJobTitle}
          onDelete={handleDeleteJobTitle}
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

  // Check if user has permission to view job titles
  if (!canViewJobTitle) {
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
            toggle={toggleAddJobTitleDrawer}
            onBulkAction={handleBulkAction}
            onShowAllColumns={
              Object.keys(columnVisibilityModel).some(key => !columnVisibilityModel[key])
                ? handleShowAllColumns
                : undefined
            }
            canCreate={canCreateJobTitle}
            canUpdate={canUpdateJobTitle}
            canDelete={canDeleteJobTitle}
          />

          <DataGrid
            autoHeight
            pagination
            rowHeight={62}
            rows={safeJobTitles}
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

      {/* Job Title Modal */}
      <JobTitleModal
        mode={modalMode}
        open={showJobTitleModal}
        jobTitle={selectedJobTitle}
        toggle={closeJobTitleModal}
      />

      {/* Job Title History Modal */}
      <JobTitleHistoryModal
        open={showHistoryModal}
        toggle={closeHistoryModal}
        jobTitleId={selectedJobTitle?._id || ''}
        jobTitleName={selectedJobTitle?.nameEn || selectedJobTitle?.nameAr || ''}
      />

      {/* Single Job Title Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={`${t('Delete')} ${t('Job Title')}`}
        description={t('Are you sure you want to delete this job title? This action cannot be undone.')}
        btnName={t('Delete')}
        onClick={confirmDeleteJobTitle}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={showBulkDeleteModal}
        toggle={() => setShowBulkDeleteModal(false)}
        mode={`${t('Delete')} ${t('Job Titles')}`}
        description={`${t('Are you sure you want to delete %s job title(s)? This action cannot be undone.').replace(
          '%s',
          selectedRows.length.toString()
        )}`}
        btnName={selectedRows.length === 1 ? t('Delete') : t('Delete All')}
        onClick={confirmBulkDelete}
      />
    </Grid>
  )
}

JobTitles.acl = {
  subject: 'job-title-management',
  action: 'view'
}

export default JobTitles
