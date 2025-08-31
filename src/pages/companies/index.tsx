import { useState, useEffect } from 'react'
import { Card, Typography, Box, Grid, IconButton, Menu, MenuItem } from '@mui/material'
import FallbackSpinner from 'src/@core/components/spinner'
import Icon from 'src/@core/components/icon'
import { useCompanyStore } from 'src/store'
import CompanyModal from './components/CompanyModal'
import CompanyHistoryModal from './components/CompanyHistoryModal'
import TableHeader from 'src/views/apps/company/list/TableHeader'
import ConfirmationModal from 'src/components/ConfirmationModal'
import { DataGrid, GridSelectionModel, getGridStringOperators } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import { ICompany } from 'src/types'
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

const renderCompanyAvatar = (row: any, i18n?: any, t?: any) => {
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

  // Check if user has view, update, or delete permissions for companies
  const canViewCompany = canAccess('company-management')
  const canEditCompany = canUpdate('company-management')
  const canDeleteCompany = canDelete('company-management')
  const canViewCompanyHistory = canViewHistory('company-management')

  // Don't render anything if user has no permissions
  if (!canViewCompany && !canEditCompany && !canDeleteCompany && !canViewCompanyHistory) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
      {canViewCompany && <Icon icon='tabler:eye' fontSize={20} onClick={handleView} style={{ cursor: 'pointer' }} />}
      {canEditCompany && <Icon icon='tabler:edit' fontSize={20} onClick={handleEdit} style={{ cursor: 'pointer' }} />}
      {(canDeleteCompany || canViewCompany) && (
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
            {canDeleteCompany && (
              <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
                <Icon icon='tabler:trash' fontSize={20} />
                {t('Delete')}
              </MenuItem>
            )}
            {canViewCompanyHistory && (
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

const Companies = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { canAccess, canCreate, canUpdate, canDelete, canViewHistory } = usePermission()

  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<ICompany | undefined>(undefined)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'Add' | 'Edit' | 'View'>('Add')
  const [pageSize, setPageSize] = useState(10)
  const [trigger, setTrigger] = useState(false)

  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([])
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  const {
    getCompanies,
    companies = [],
    pagination,
    deleteCompany,
    deleteBulkCompanies,
    toggleBulkCompaniesActivity,
    loading
  } = useCompanyStore()

  // ** Effects - Direct API calls with pagination
  useEffect(() => {
    getCompanies({
      page: pagination?.current || 1,
      limit: pageSize
    })
  }, [getCompanies, pageSize, pagination?.current, trigger])

  const handleBulkDelete = async () => {
    try {
      if (!canDeleteCompany || selectedRows.length === 0) {
        return
      }

      setShowBulkDeleteModal(true)
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      if (!canDeleteCompany) return
      const success = await deleteBulkCompanies(selectedRows as string[])
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
        setShowBulkDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting companies:', error)
    }
  }

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({})
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    try {
      if (!canUpdateCompany || selectedRows.length === 0) {
        return
      }

      const statusBoolean = status === 'active'
      const success = await toggleBulkCompaniesActivity(selectedRows as string[], statusBoolean)
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
      }
    } catch (error) {
      console.error(`Error updating companies status to ${status}:`, error)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'Delete':
        if (canDeleteCompany) handleBulkDelete()
        break
      case 'Active':
        if (canUpdateCompany) handleBulkStatusChange('active')
        break
      case 'Inactive':
        if (canUpdateCompany) handleBulkStatusChange('inactive')
        break
      default:
        break
    }
  }

  // Check permissions for companies
  const canViewCompany = canAccess('company-management')
  const canCreateCompany = canCreate('company-management')
  const canUpdateCompany = canUpdate('company-management')
  const canDeleteCompany = canDelete('company-management')
  const canViewCompanyHistory = canViewHistory('company-management')

  // ** Handlers
  const toggleAddCompanyDrawer = () => {
    if (!canCreateCompany) return
    setModalMode('Add')
    setSelectedCompany(undefined)
    setShowCompanyModal(!showCompanyModal)
  }

  const closeCompanyModal = () => {
    setShowCompanyModal(false)
  }

  const handleEditCompany = (companyId: any) => {
    if (!canUpdateCompany) return
    const company = companies.find(c => c._id === companyId)
    setSelectedCompany(company)
    setModalMode('Edit')
    setShowCompanyModal(true)
  }

  const handleViewCompany = (companyId: any) => {
    if (!canViewCompany) return
    const company = companies.find(c => c._id === companyId)
    setSelectedCompany(company)
    setModalMode('View')
    setShowCompanyModal(true)
  }

  const handleDeleteCompany = (companyId: any) => {
    if (!canDeleteCompany) return
    setCompanyToDelete(companyId)
    // Check if this company is selected in the DataGrid
    const isSelected = selectedRows.includes(companyId)
    // If company is selected, show bulk delete modal, otherwise show single delete modal
    if (isSelected) {
      setShowBulkDeleteModal(true)
    } else {
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteCompany = async () => {
    try {
      if (companyToDelete && canDeleteCompany) {
        await deleteCompany(companyToDelete)
        setTrigger(!trigger)
        setShowDeleteModal(false)
        setCompanyToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting company:', error)
    }
  }

  const handleViewHistory = (companyId: any) => {
    if (!canViewCompanyHistory) return
    const company = companies.find(c => c._id === companyId)
    setSelectedCompany(company)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
  }

  const safeCompanies = Array.isArray(companies) ? companies : []

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
            {renderCompanyAvatar(row, i18n, t)}
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                cursor: 'pointer'
              }}
              onClick={() => handleViewCompany(row._id)}
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
          onEdit={handleEditCompany}
          onView={handleViewCompany}
          onDelete={handleDeleteCompany}
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

  // Check if user has permission to view companies
  if (!canViewCompany) {
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
            toggle={toggleAddCompanyDrawer}
            onBulkAction={handleBulkAction}
            onShowAllColumns={
              Object.keys(columnVisibilityModel).some(key => !columnVisibilityModel[key])
                ? handleShowAllColumns
                : undefined
            }
            canCreate={canCreateCompany}
            canUpdate={canUpdateCompany}
            canDelete={canDeleteCompany}
          />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={safeCompanies}
            columns={columns}
            pageSize={pageSize}
            page={pagination?.current ? pagination.current - 1 : 0}
            rowCount={pagination?.total || 0}
            paginationMode='server'
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={rows => setSelectedRows(rows)}
            selectionModel={selectedRows}
            rowsPerPageOptions={[10, 25, 50]}
            localeText={{ noRowsLabel: t('No Records Found') }}
            onPageSizeChange={newPageSize => {
              setPageSize(newPageSize)
              // Reset to first page when changing page size
              getCompanies({
                page: 1,
                limit: newPageSize
              })
            }}
            onPageChange={newPage => {
              if (pagination) {
                getCompanies({
                  page: newPage + 1,
                  limit: pageSize
                })
              }
            }}
            getRowId={row => row._id}
            loading={loading}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            disableColumnMenu={false}
          />
        </Card>
      </Grid>

      {/* Company Modal */}
      <CompanyModal mode={modalMode} open={showCompanyModal} company={selectedCompany} toggle={closeCompanyModal} />

      {/* Company History Modal */}
      <CompanyHistoryModal
        open={showHistoryModal}
        toggle={closeHistoryModal}
        companyId={selectedCompany?._id || ''}
        companyName={selectedCompany?.nameEn || selectedCompany?.nameAr || ''}
      />

      {/* Single Company Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={t('Delete Company')}
        description={t('Are you sure you want to delete this company? This action cannot be undone.')}
        btnName={t('Delete')}
        onClick={confirmDeleteCompany}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={showBulkDeleteModal}
        toggle={() => setShowBulkDeleteModal(false)}
        mode={t('Delete Companies')}
        description={t('Are you sure you want to delete %s company(ies)? This action cannot be undone.').replace(
          '%s',
          selectedRows.length.toString()
        )}
        btnName={selectedRows.length === 1 ? t('Delete') : t('Delete All')}
        onClick={confirmBulkDelete}
      />
    </Grid>
  )
}

Companies.acl = {
  subject: 'company-management',
  action: 'view'
}

export default Companies
