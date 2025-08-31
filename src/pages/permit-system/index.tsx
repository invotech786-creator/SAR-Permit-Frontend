import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CardHeader,
  Divider,
  TablePagination,
  Tooltip
} from '@mui/material'
import FallbackSpinner from 'src/@core/components/spinner'
import { showErrorMessage, showSuccessMessage } from 'src/components'
import Icon from 'src/@core/components/icon'
import { permitService } from 'src/services/permitService'
import { IDepartment, IPermit, IPermitResponse, IUser } from 'src/types'
import { useTranslation } from 'react-i18next'
import { usePermission } from 'src/utils/permissions'
import useUserStore from 'src/store/useUserStore'
import AddPermitModal from './components/AddPermitModal'
import ViewPermitModal from './components/ViewPermitModal'
import EditPermitModal from './components/EditPermitModal'
import PrintPermitModal from './components/PrintPermitModal'
import PermitFilterDialog, { PermitFilters } from './components/PermitFilterDialog'
import ConfirmationModal from 'src/components/ConfirmationModal'

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const PermitSystem = memo(() => {
  const { t, i18n } = useTranslation()
  const { canAccess, canUpdate, canDelete, canCreate } = usePermission()
  const { users: storeUsers, getUsers } = useUserStore()

  const [departments, setDepartments] = useState<IDepartment[]>([])
  const [permits, setPermits] = useState<IPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPermits, setTotalPermits] = useState(0)
  const [pageSize, setPageSize] = useState(5) // Reduced to 5 to test pagination
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permitToDelete, setPermitToDelete] = useState<IPermit | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addPermitModalOpen, setAddPermitModalOpen] = useState(false)
  const [viewPermitModalOpen, setViewPermitModalOpen] = useState(false)
  const [editPermitModalOpen, setEditPermitModalOpen] = useState(false)
  const [printPermitModalOpen, setPrintPermitModalOpen] = useState(false)
  const [selectedPermit, setSelectedPermit] = useState<IPermit | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<PermitFilters>({})
  const [users, setUsers] = useState<IUser[]>([])
  const [filtersApplied, setFiltersApplied] = useState(false)

  // Get current language
  const currentLang = i18n.language
  const isArabic = currentLang === 'ar'

  // Debounce search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoize permission check to prevent unnecessary re-renders
  const hasAccess = useMemo(() => canAccess('permit-management'), [canAccess])

  // Fetch users for filter dialog
  useEffect(() => {
    if (storeUsers.length === 0) {
      getUsers()
    }
  }, [storeUsers.length, getUsers])

  // Update local users state when store users change
  useEffect(() => {
    setUsers(storeUsers)
  }, [storeUsers])

  // Memoize filtered permits to prevent recalculation on every render
  const filteredPermits = useMemo(() => {
    if (!permits.length) return []

    let filtered = permits

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(permit => {
        const searchLower = debouncedSearchTerm.toLowerCase()
        return (
          permit.purposeEn?.toLowerCase().includes(searchLower) ||
          permit.purposeAr?.toLowerCase().includes(searchLower) ||
          permit.number?.toLowerCase().includes(searchLower) ||
          permit.companyId?.nameEn?.toLowerCase().includes(searchLower) ||
          permit.companyId?.nameAr?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(permit => permit.startingDepartmentId?._id === selectedDepartment)
    }

    // Filter by status
    if (selectedStatus) {
      const statusNumber = selectedStatus === 'approved' ? 1 : 2
      filtered = filtered.filter(permit => permit.currentStatus === statusNumber)
    }

    return filtered
  }, [permits, debouncedSearchTerm, selectedDepartment, selectedStatus])

  // Handle Add Permit modal
  const handleAddPermit = () => {
    setAddPermitModalOpen(true)
  }

  const handleCloseAddPermit = () => {
    setAddPermitModalOpen(false)
  }

  // Handle View Permit modal
  const handleViewPermit = (permit: IPermit) => {
    setSelectedPermit(permit)
    setViewPermitModalOpen(true)
  }

  const handleCloseViewPermit = () => {
    setViewPermitModalOpen(false)
    setSelectedPermit(null)
  }

  // Handle Edit Permit modal
  const handleEditPermit = (permit: IPermit) => {
    // Check if permit can be edited based on status
    if (permit.currentStatus === 1 || permit.currentStatus === 2) {
      const statusText = getStatusText(permit.currentStatus)
      const message = isArabic
        ? `لا يمكن تحديث التصريح - الحالة: ${statusText}`
        : `Can't be updated - Status: ${statusText}`
      showErrorMessage(message)
      return
    }

    setSelectedPermit(permit)
    setEditPermitModalOpen(true)
  }

  const handleCloseEditPermit = () => {
    setEditPermitModalOpen(false)
    setSelectedPermit(null)
  }

  // Handle Print Permit modal
  const handlePrintPermit = (permit: IPermit) => {
    setSelectedPermit(permit)
    setPrintPermitModalOpen(true)
  }

  const handleClosePrintPermit = () => {
    setPrintPermitModalOpen(false)
    setSelectedPermit(null)
  }

  // Handle Filter Dialog
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true)
  }

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false)
  }

  const handleApplyFilters = async (filters: PermitFilters) => {
    setCurrentFilters(filters)
    setCurrentPage(1) // Reset to first page when applying filters
    setFiltersApplied(true) // Mark that filters are applied

    // Apply filters to the permits list
    try {
      setLoading(true)
      const response = await permitService.getPermits({
        ...filters,
        page: 1,
        limit: pageSize
      })

      setPermits(response.permits)
      setTotalPages(response.pagination.pages)
      setTotalPermits(response.pagination.total)

      showSuccessMessage('Filters applied successfully')
    } catch (error) {
      console.error('Error applying filters:', error)
      showErrorMessage('Failed to apply filters')
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = async () => {
    setCurrentFilters({})
    setCurrentPage(1) // Reset to first page when resetting filters
    setFiltersApplied(false) // Mark that filters are no longer applied

    // Reset filters and reload permits
    try {
      setLoading(true)
      await fetchPermits(1)
      showSuccessMessage('Filters reset successfully')
    } catch (error) {
      console.error('Error resetting filters:', error)
      showErrorMessage('Failed to reset filters')
    } finally {
      setLoading(false)
    }
  }

  // Memoize department permit counts
  const departmentPermitCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}

    departments.forEach(dept => {
      counts[dept._id] = permits.filter(permit => permit.startingDepartmentId._id === dept._id).length
    })

    return counts
  }, [departments, permits])

  // Memoize status permit counts
  const statusPermitCounts = useMemo(() => {
    const approvedCount = permits.filter(permit => permit.currentStatus === 1).length
    const declinedCount = permits.filter(permit => permit.currentStatus === 2).length

    return { approved: approvedCount, declined: declinedCount }
  }, [permits])

  // Memoize status color function
  const getStatusColor = useCallback((status: number) => {
    switch (status) {
      case 0:
        return 'warning'
      case 1:
        return 'success'
      case 2:
        return 'error'
      default:
        return 'warning'
    }
  }, [])

  // Memoize status text function
  const getStatusText = useCallback(
    (status: number) => {
      switch (status) {
        case 0:
          return isArabic ? 'قيد المراجعة' : 'Pending'
        case 1:
          return isArabic ? 'موافق' : 'Approved'
        case 2:
          return isArabic ? 'مرفوض' : 'Declined'
        default:
          return isArabic ? 'قيد المراجعة' : 'Pending'
      }
    },
    [isArabic]
  )

  // Memoize date formatting function
  const formatDate = useCallback(
    (dateString: string) => {
      return new Date(dateString).toLocaleDateString(isArabic ? 'ar-SA' : 'en-GB')
    },
    [isArabic]
  )

  // Memoize department change handler
  const handleDepartmentChange = useCallback((departmentId: string) => {
    setSelectedDepartment(departmentId)
    setSelectedStatus(null) // Reset status selection when changing department
    setCurrentPage(1) // Reset to first page when changing department
  }, [])

  // Memoize status change handler
  const handleStatusChange = useCallback((status: string | null) => {
    setSelectedStatus(status)
    setSelectedDepartment('all') // Reset department selection when changing status
    setCurrentPage(1) // Reset to first page when changing status
  }, [])

  // Memoize search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Fetch permits with current filters for pagination
  const fetchPermitsWithFilters = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true)
        const response = await permitService.getPermits({
          ...currentFilters,
          page,
          limit: pageSize
        })

        setPermits(response.permits)
        setTotalPages(response.pagination.pages)
        setTotalPermits(response.pagination.total)
      } catch (error) {
        console.error('Error fetching permits with filters:', error)
        showErrorMessage('Failed to load filtered permits data')
      } finally {
        setLoading(false)
      }
    },
    [currentFilters, pageSize]
  )

  // Handle delete confirmation dialog
  const handleDeleteClick = useCallback((permit: IPermit) => {
    setPermitToDelete(permit)
    setDeleteDialogOpen(true)
  }, [])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!permitToDelete) return

    try {
      setDeleteLoading(true)
      await permitService.deletePermit(permitToDelete._id)

      // Remove the deleted permit from the local state
      setPermits(prevPermits => prevPermits.filter(p => p._id !== permitToDelete._id))

      // Update total count
      setTotalPermits(prev => prev - 1)

      // Show success message
      showSuccessMessage('Permit deleted successfully')

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setPermitToDelete(null)

      // Refresh the current page if needed
      if (permits.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error deleting permit:', error)
      showErrorMessage('Failed to delete permit')
    } finally {
      setDeleteLoading(false)
    }
  }, [permitToDelete, permits.length, currentPage])

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setPermitToDelete(null)
  }, [])

  // Fetch permits data
  const fetchPermits = useCallback(
    async (page: number = 1) => {
      try {
        const response = await permitService.getPermits({
          page,
          limit: pageSize
        })

        setPermits(response.permits)
        setTotalPages(response.pagination.pages)
        setTotalPermits(response.pagination.total)
      } catch (error) {
        console.error('Error fetching permits:', error)
        showErrorMessage('Failed to load permits data')
      }
    },
    [pageSize]
  )

  // Handle page change
  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page)

      // If filters are applied, fetch permits with filters for the new page
      if (filtersApplied) {
        fetchPermitsWithFilters(page)
      } else {
        fetchPermits(page)
      }
    },
    [filtersApplied, fetchPermits, fetchPermitsWithFilters]
  )

  useEffect(() => {
    if (!hasAccess) {
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch departments
        const deps = await permitService.getDepartments()
        setDepartments(deps)

        // Fetch permits for first page
        await fetchPermits(1)
      } catch (error) {
        console.error('Error fetching permit system data:', error)
        showErrorMessage('Failed to load permit system data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hasAccess, fetchPermits])

  // Fetch permits when page changes
  useEffect(() => {
    if (hasAccess && !loading && !filtersApplied) {
      fetchPermits(currentPage)
    }
  }, [currentPage, hasAccess, loading, fetchPermits, filtersApplied])

  // Handle permit creation/update success
  const handlePermitCreated = useCallback(() => {
    // Refresh the permits list
    fetchPermits(currentPage)
  }, [fetchPermits, currentPage])

  // Handle permit status update
  const handlePermitStatusUpdated = useCallback(() => {
    // Refresh the permits list to show updated status
    fetchPermits(currentPage)
  }, [fetchPermits, currentPage])

  // Helper function to get localized text
  const getLocalizedText = useCallback(
    (enText: string, arText: string) => {
      return isArabic ? arText : enText
    },
    [isArabic]
  )

  // Early return for loading
  if (loading) {
    return <FallbackSpinner />
  }

  // Early return for no access
  if (!hasAccess) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>
          You don't have permission to access this page
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 5, width: '100%' }}>
      {/* Search and Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}
      >
        <TextField
          placeholder={isArabic ? 'البحث في التصاريح' : 'Search from Permits'}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => setSearchTerm('')} sx={{ mr: -0.5 }}>
                  <Icon icon='tabler:x' />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 300 }}
          key='search-input'
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            startIcon={<Icon icon='tabler:filter' />}
            sx={{ minWidth: 120 }}
            onClick={handleOpenFilterDialog}
          >
            {isArabic ? 'تصفية' : 'Filter'}
          </Button>

          {canCreate('permit-management') && (
            <Button
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              sx={{ minWidth: 140 }}
              onClick={handleAddPermit}
            >
              {isArabic ? 'إضافة تصريح' : 'Add Permit'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Department Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Left Arrow */}
          <IconButton
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
            onClick={() => {
              const container = document.getElementById('cards-scroll-container')
              if (container) {
                container.scrollLeft -= 300
              }
            }}
          >
            <Icon icon='tabler:chevron-left' />
          </IconButton>

          {/* Right Arrow */}
          <IconButton
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
            onClick={() => {
              const container = document.getElementById('cards-scroll-container')
              if (container) {
                container.scrollLeft += 300
              }
            }}
          >
            <Icon icon='tabler:chevron-right' />
          </IconButton>

          {/* Scrollable Cards Container */}
          <Box
            id='cards-scroll-container'
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              pb: 1
            }}
          >
            {/* All Permits Card */}
            <Card
              sx={{
                backgroundColor: selectedDepartment === 'all' && !selectedStatus ? 'primary.main' : 'white',
                color: selectedDepartment === 'all' && !selectedStatus ? 'white' : 'grey',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                height: 120,
                minWidth: 200,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: selectedDepartment === 'all' && !selectedStatus ? 'primary.dark' : 'grey.50'
                }
              }}
              onClick={() => {
                handleDepartmentChange('all')
                setSelectedStatus(null)
              }}
            >
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant='h4'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: selectedDepartment === 'all' && !selectedStatus ? 'white' : 'grey'
                  }}
                >
                  {totalPermits}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: selectedDepartment === 'all' && !selectedStatus ? 'white' : 'grey' }}
                >
                  {isArabic ? 'جميع التصاريح' : 'All Permits'}
                </Typography>
              </CardContent>
            </Card>

            {/* Department Cards */}
            {departments.map(dept => (
              <Card
                key={dept._id}
                sx={{
                  backgroundColor: selectedDepartment === dept._id ? 'primary.main' : 'white',
                  color: selectedDepartment === dept._id ? 'white' : 'grey',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: 120,
                  minWidth: 200,
                  flexShrink: 0,
                  '&:hover': { backgroundColor: selectedDepartment === dept._id ? 'primary.dark' : 'grey.50' }
                }}
                onClick={() => handleDepartmentChange(dept._id)}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography
                    variant='h4'
                    sx={{ mb: 1, fontWeight: 600, color: selectedDepartment === dept._id ? 'white' : 'grey' }}
                  >
                    {departmentPermitCounts[dept._id] || 0}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: selectedDepartment === dept._id ? 'white' : 'grey'
                    }}
                  >
                    {getLocalizedText(dept.nameEn, dept.nameAr)}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {/* Approved Permits Status Card */}
            <Card
              sx={{
                backgroundColor: selectedStatus === 'approved' ? 'primary.main' : 'white',
                color: selectedStatus === 'approved' ? 'white' : 'grey',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                height: 120,
                minWidth: 200,
                flexShrink: 0,
                '&:hover': { backgroundColor: selectedStatus === 'approved' ? 'primary.dark' : 'grey.50' }
              }}
              onClick={() => handleStatusChange(selectedStatus === 'approved' ? null : 'approved')}
            >
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant='h4'
                  sx={{ mb: 1, fontWeight: 600, color: selectedStatus === 'approved' ? 'white' : 'grey' }}
                >
                  {statusPermitCounts.approved}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: selectedStatus === 'approved' ? 'white' : 'grey'
                  }}
                >
                  {isArabic ? 'التصاريح المعتمدة' : 'Approved Permits'}
                </Typography>
              </CardContent>
            </Card>

            {/* Declined Permits Status Card */}
            <Card
              sx={{
                backgroundColor: selectedStatus === 'declined' ? 'primary.main' : 'white',
                color: selectedStatus === 'declined' ? 'white' : 'grey',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                height: 120,
                minWidth: 200,
                flexShrink: 0,
                '&:hover': { backgroundColor: selectedStatus === 'declined' ? 'primary.dark' : 'grey.50' }
              }}
              onClick={() => handleStatusChange(selectedStatus === 'declined' ? null : 'declined')}
            >
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant='h4'
                  sx={{ mb: 1, fontWeight: 600, color: selectedStatus === 'declined' ? 'white' : 'grey' }}
                >
                  {statusPermitCounts.declined}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: selectedStatus === 'declined' ? 'white' : 'grey'
                  }}
                >
                  {isArabic ? 'التصاريح المرفوضة' : 'Declined Permits'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Permits Table */}
      <Card>
        <CardHeader title={isArabic ? 'قائمة التصاريح' : 'Permits List'} />
        <Divider />
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{isArabic ? 'نوع التصريح' : 'Permit Type'}</TableCell>
                <TableCell>{isArabic ? 'اسم الشركة' : 'Company Name'}</TableCell>
                <TableCell>{isArabic ? 'الغرض' : 'Purpose'}</TableCell>
                <TableCell>{isArabic ? 'رقم التصريح' : 'Work Permit Number'}</TableCell>
                <TableCell>{isArabic ? 'تاريخ البداية' : 'Start Date'}</TableCell>
                <TableCell>{isArabic ? 'تاريخ الانتهاء' : 'End Date'}</TableCell>
                <TableCell>{isArabic ? 'الحالة' : 'Status'}</TableCell>
                <TableCell>{isArabic ? 'اسم المسؤول' : 'Responsible Name'}</TableCell>
                <TableCell>{isArabic ? 'رقم المسؤول' : 'Responsible Number'}</TableCell>
                <TableCell>{isArabic ? 'تاريخ الإنشاء' : 'Created At'}</TableCell>
                <TableCell>{isArabic ? 'المواقع' : 'Locations'}</TableCell>
                <TableCell>{isArabic ? 'تمت الإضافة بواسطة' : 'Added By'}</TableCell>
                <TableCell>{isArabic ? 'الإجراءات' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit, index) => (
                  <TableRow key={`${permit._id}-${index}`} hover>
                    <TableCell>
                      <Chip
                        label={
                          permit.type === 'entry'
                            ? isArabic
                              ? 'دخول'
                              : 'Entry'
                            : permit.type === 'exit'
                            ? isArabic
                              ? 'خروج'
                              : 'Exit'
                            : permit.type === 'entry and exit'
                            ? isArabic
                              ? 'دخول وخروج'
                              : 'Entry and Exit'
                            : permit.type
                        }
                        color='primary'
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {getLocalizedText(permit.companyId.nameEn, permit.companyId.nameAr)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{getLocalizedText(permit.purposeEn, permit.purposeAr)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {permit.number || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(permit.startDate)}</TableCell>
                    <TableCell>{formatDate(permit.endDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(permit.currentStatus)}
                        color={getStatusColor(permit.currentStatus) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {getLocalizedText(permit.responsibleId.nameEn, permit.responsibleId.nameAr)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        color='primary'
                        sx={{
                          direction: 'ltr', // Force LTR for phone numbers to ensure + is at the start
                          textAlign: isArabic ? 'right' : 'left',
                          unicodeBidi: 'plaintext' // Ensure proper text direction handling
                        }}
                      >
                        {permit.responsibleId.phone && !permit.responsibleId.phone.startsWith('+')
                          ? `+${permit.responsibleId.phone}`
                          : permit.responsibleId.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(permit.createdAt)}</TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ maxWidth: 150 }}>
                        {permit.locations.map(loc => getLocalizedText(loc.nameEn, loc.nameAr)).join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {getLocalizedText(permit.createdBy.nameEn, permit.createdBy.nameAr)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={isArabic ? 'عرض التصريح' : 'View Permit'}>
                        <IconButton size='small' color='primary' onClick={() => handleViewPermit(permit)}>
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isArabic ? 'طباعة التصريح' : 'Print Permit'}>
                        <IconButton size='small' color='info' onClick={() => handlePrintPermit(permit)}>
                          <Icon icon='tabler:printer' />
                        </IconButton>
                      </Tooltip>
                      {canUpdate('permit-management') && (
                        <Tooltip title={isArabic ? 'تعديل التصريح' : 'Edit Permit'}>
                          <IconButton size='small' color='secondary' onClick={() => handleEditPermit(permit)}>
                            <Icon icon='tabler:edit' />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete('permit-management') && (
                        <Tooltip title={isArabic ? 'حذف التصريح' : 'Delete Permit'}>
                          <IconButton size='small' color='error' onClick={() => handleDeleteClick(permit)}>
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align='center' sx={{ py: 8 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {isArabic ? 'لا توجد سجلات' : 'No records found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {permits.length > 0 && (
          <TablePagination
            component='div'
            count={totalPermits}
            page={currentPage - 1}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(event, newPage) => handlePageChange(event, newPage + 1)}
            onRowsPerPageChange={event => {
              const newPageSize = parseInt(event.target.value, 10)
              setPageSize(newPageSize)
              setCurrentPage(1)
              // Refresh data with new page size
              if (filtersApplied) {
                fetchPermitsWithFilters(1)
              } else {
                fetchPermits(1)
              }
            }}
            labelDisplayedRows={({ from, to, count }) =>
              isArabic
                ? `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
                : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            labelRowsPerPage={isArabic ? 'صفوف في الصفحة:' : 'Rows per page:'}
          />
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        open={deleteDialogOpen}
        toggle={handleDeleteCancel}
        mode={t('Delete Permit')}
        description={t('Are you sure you want to delete this permit? This action cannot be undone.')}
        btnName={t('Delete')}
        onClick={handleDeleteConfirm}
      />

      {/* Add Permit Modal */}
      <AddPermitModal open={addPermitModalOpen} onClose={handleCloseAddPermit} onSuccess={handlePermitCreated} />

      {/* View Permit Modal */}
      <ViewPermitModal open={viewPermitModalOpen} onClose={handleCloseViewPermit} permit={selectedPermit} />

      {/* Edit Permit Modal */}
      <EditPermitModal
        open={editPermitModalOpen}
        onClose={handleCloseEditPermit}
        onSuccess={handlePermitCreated}
        onStatusUpdate={handlePermitStatusUpdated}
        permit={selectedPermit}
      />

      {/* Print Permit Modal */}
      <PrintPermitModal open={printPermitModalOpen} onClose={handleClosePrintPermit} permit={selectedPermit} />

      {/* Filter Dialog */}
      <PermitFilterDialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        currentFilters={currentFilters}
        departments={departments}
        users={users}
      />
    </Box>
  )
})

export default PermitSystem
