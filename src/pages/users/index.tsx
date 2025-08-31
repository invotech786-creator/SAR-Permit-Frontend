import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material'
import FallbackSpinner from 'src/@core/components/spinner'
import { showErrorMessage } from 'src/components'
import Icon from 'src/@core/components/icon'
import { useUserStore, useRoleStore, useCompanyStore, useJobTitleStore } from 'src/store'
import UserModal from './components/UserModal'
import UserHistoryModal from './components/UserHistoryModal'
import TableHeader from 'src/views/apps/user/list/TableHeader'
import ConfirmationModal from 'src/components/ConfirmationModal'
import { DataGrid, GridSelectionModel, getGridStringOperators } from '@mui/x-data-grid'

import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'
import { getInitials } from 'src/@core/utils/get-initials'

import { IUser } from 'src/types'
import { useTranslation } from 'react-i18next'
import { usePermission } from 'src/utils/permissions'

// ** User role icons and colors
type ColorType = 'secondary' | 'success' | 'info' | 'primary' | 'warning' | 'error'

const userRoleObj: { [key: string]: { icon: string; color: ColorType } } = {
  admin: { icon: 'tabler:device-laptop', color: 'secondary' },
  author: { icon: 'tabler:circle-check', color: 'success' },
  editor: { icon: 'tabler:edit', color: 'info' },
  maintainer: { icon: 'tabler:chart-pie-2', color: 'primary' },
  subscriber: { icon: 'tabler:user', color: 'warning' }
}

// ** Helper function to safely convert value to string
const safeString = (value: any, t?: any): string => {
  if (value === null || value === undefined) return t ? t('N/A') : 'N/A'
  if (typeof value === 'object') {
    if (value.nameEn) return String(value.nameEn)
    if (value.nameAr) return String(value.nameAr)
    if (value.username) return String(value.username)

    return t ? t('N/A') : 'N/A'
  }

  return String(value)
}

// ** Renders client column
const renderClient = (row: any) => {
  if (row.profilePic) {
    return <CustomAvatar src={row.profilePic} sx={{ mr: 2.5, width: 38, height: 38 }} />
  } else {
    const displayName = safeString(row.nameEn || row.nameAr || row.fullName)

    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 2.5, width: 38, height: 38, fontSize: '1rem', fontWeight: 500 }}
      >
        {getInitials(displayName)}
      </CustomAvatar>
    )
  }
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

  // Check if user has permissions for users
  const canViewUser = canAccess('user-management')
  const canEditUser = canUpdate('user-management')
  const canDeleteUser = canDelete('user-management')
  const canViewUserHistory = canViewHistory('user-management')

  // Don't render anything if user has no permissions
  if (!canViewUser && !canEditUser && !canDeleteUser && !canViewUserHistory) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
      {canViewUser && <Icon icon='tabler:eye' fontSize={20} onClick={handleView} style={{ cursor: 'pointer' }} />}
      {canEditUser && <Icon icon='tabler:edit' fontSize={20} onClick={handleEdit} style={{ cursor: 'pointer' }} />}
      {(canDeleteUser || canViewUser) && (
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
            {canDeleteUser && (
              <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 } }}>
                <Icon icon='tabler:trash' fontSize={20} />
                {t('Delete')}
              </MenuItem>
            )}
            {canViewUserHistory && (
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

const Users = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Use the same pattern as companies and job titles modules
  const getCurrentLocale = () => {
    return i18n?.language || 'en'
  }

  const locale = getCurrentLocale()

  const { canAccess, canCreate, canUpdate, canDelete, canViewHistory } = usePermission()
  // ** State
  const [showUserModal, setShowUserModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'Add' | 'Edit' | 'View'>('Add')
  const [filters, setFilters] = useState({
    searchStr: null,
    role: '',
    status: 'all'
  })
  const [pageSize, setPageSize] = useState(10)
  const [trigger, setTrigger] = useState(false)
  const [value, setValue] = useState('')

  // Remove the local loading state since we'll use the store's loading state
  const [debouncedValue, setDebouncedValue] = useState('')
  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([])
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  // ** Store hooks
  const {
    getUsers,
    users = [],
    pagination,
    stats,
    deleteUser,
    deleteBulkUsers,
    toggleBulkUsersActivity,
    loading
  } = useUserStore()
  const { getRoles, roles = [] } = useRoleStore()
  const { getCompanies, companies = [] } = useCompanyStore()
  const { getJobTitles, jobTitles = [] } = useJobTitleStore()

  // ** Debounce search value to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [value])

  // Check permissions for users
  const canViewUser = canAccess('user-management')
  const canCreateUser = canCreate('user-management')
  const canUpdateUser = canUpdate('user-management')
  const canDeleteUser = canDelete('user-management')
  const canViewUserHistory = canViewHistory('user-management')

  // ** Bulk action handlers
  const handleBulkDelete = async () => {
    try {
      if (!canDeleteUser || selectedRows.length === 0) {
        if (selectedRows.length === 0) {
          showErrorMessage(t('Please select users to delete'))
        }
        return
      }

      setShowBulkDeleteModal(true)
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      if (!canDeleteUser) return
      const success = await deleteBulkUsers(selectedRows as string[])
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
        setShowBulkDeleteModal(false)
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
    }
  }

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({})
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    try {
      if (!canUpdateUser || selectedRows.length === 0) {
        if (selectedRows.length === 0) {
          showErrorMessage(t('Please select users to update'))
        }
        return
      }

      const statusBoolean = status === 'active'
      const success = await toggleBulkUsersActivity(selectedRows as string[], statusBoolean)
      if (success) {
        setSelectedRows([])
        setTrigger(!trigger)
      }
    } catch (error) {
      console.error(`Error updating users status to ${status}:`, error)
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'Delete':
        if (canDeleteUser) handleBulkDelete()
        break
      case 'Active':
        if (canUpdateUser) handleBulkStatusChange('active')
        break
      case 'Inactive':
        if (canUpdateUser) handleBulkStatusChange('inactive')
        break
      default:
        break
    }
  }

  // ** Effects - Direct API calls to avoid dependency issues
  useEffect(() => {
    getUsers({
      page: pagination?.current || 1,
      limit: pageSize,
      search: debouncedValue,
      ...(filters.role && { roleId: filters.role }),
      ...(filters.status && filters.status !== 'all' && { status: filters.status === 'true' ? 'active' : 'inactive' })
    })
  }, [getUsers, pageSize, debouncedValue, filters.role, filters.status, pagination?.current, trigger])

  // Commented out automatic API calls to prevent them from running on login
  // useEffect(() => {
  //   getRoles()
  //   getCompanies({ limit: 1000 })
  //   getJobTitles({ limit: 1000 })
  // }, [getRoles, getCompanies, getJobTitles])

  // ** Handlers
  const handleFilter = (val: any) => {
    setValue(val)
  }

  const handleRoleChange = (e: any) => {
    setFilters(prev => ({ ...prev, role: e.target.value }))
  }

  const handleStatusChange = (e: any) => {
    setFilters(prev => ({ ...prev, status: e.target.value }))
  }

  const toggleAddUserDrawer = () => {
    if (!canCreateUser) return
    setModalMode('Add')
    setSelectedUser(undefined)
    setShowUserModal(!showUserModal)
  }

  const closeUserModal = () => {
    setShowUserModal(false)
  }

  const handleEditUser = (userId: any) => {
    if (!canUpdateUser) return
    const user = users.find(u => u._id === userId)
    setSelectedUser(user || undefined)
    setModalMode('Edit')
    setShowUserModal(true)
  }

  const handleViewUser = (userId: any) => {
    if (!canViewUser) return
    const user = users.find(u => u._id === userId)
    if (user) {
      setSelectedUser(user)
      setModalMode('View')
      setShowUserModal(true)
    }
  }

  const handleDeleteUser = (userId: any) => {
    if (!canDeleteUser) return
    setUserToDelete(userId)
    // Check if this user is selected in the DataGrid
    const isSelected = selectedRows.includes(userId)
    // If user is selected, show bulk delete modal, otherwise show single delete modal
    if (isSelected) {
      setShowBulkDeleteModal(true)
    } else {
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteUser = async () => {
    try {
      if (userToDelete && canDeleteUser) {
        await deleteUser(userToDelete)
        setTrigger(!trigger)
        setShowDeleteModal(false)
        setUserToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleViewHistory = (userId: any) => {
    if (!canViewUserHistory) return
    const user = users.find(u => u._id === userId)
    setSelectedUser(user)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
  }

  // ** Safe data access
  const safeUsers = Array.isArray(users) ? users : []
  const safeRoles = Array.isArray(roles) ? roles : []

  // ** Helper function to convert numbers to Eastern Arabic numerals when locale is Arabic
  const convertToArabicNumerals = (num: number): string => {
    if (locale === 'ar') {
      return num.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
    }
    return num.toString()
  }

  // ** Stats data - Using API response data
  const statsHorizontalWithDetails = [
    {
      title: t('Active Users'),
      stats: convertToArabicNumerals(stats.activeCount),
      icon: 'tabler:user-check',
      color: 'success',
      subtitle: '',
      trendDiff: convertToArabicNumerals(stats.activePercentage)
    },
    {
      title: t('Inactive Users'),
      stats: convertToArabicNumerals(stats.inactiveCount),
      icon: 'tabler:user-x',
      color: 'secondary',
      subtitle: '',
      trendDiff: convertToArabicNumerals(stats.inactivePercentage)
    }
  ]

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

  // ** Column definitions
  const columns = [
    {
      flex: 1,
      minWidth: 250,
      field: 'nameEn',
      headerName: t('Name'),
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: ({ row }: any) => {
        // Use the display name for filtering
        return safeString(
          locale === 'ar' ? row.nameAr || row.nameEn || row.fullName : row.nameEn || row.nameAr || row.fullName,
          t
        )
      },
      renderCell: ({ row }: any) => {
        const displayName = safeString(
          locale === 'ar' ? row.nameAr || row.nameEn || row.fullName : row.nameEn || row.nameAr || row.fullName
        )

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                  cursor: 'pointer'
                }}
                onClick={() => handleViewUser(row._id)}
              >
                {displayName}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.disabled',
                  lineHeight: 1
                }}
              >
                {safeString(
                  locale === 'ar' ? row.nameAr || row.nameEn || row.username : row.username || row.nameEn || row.nameAr,
                  t
                )}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'email',
      headerName: t('Email'),
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: ({ row }: any) => {
        // Use the email for filtering
        return safeString(row.email, t)
      },
      renderCell: ({ row }: any) => {
        return <Typography sx={{ color: 'text.secondary' }}>{safeString(row.email, t)}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'phone',
      headerName: t('Phone'),
      sortable: true,
      filterable: true,
      filterOperators: getGridStringOperators().filter(operator => operator.value !== 'isAnyOf'),
      valueGetter: ({ row }: any) => {
        // Use the phone for filtering
        const phoneValue = safeString(row.phone, t)
        return phoneValue
      },
      renderCell: ({ row }: any) => {
        const phoneValue = safeString(row.phone, t)
        if (!phoneValue || phoneValue === 'N/A') {
          return <Typography sx={{ color: 'text.secondary' }}>{phoneValue}</Typography>
        }

        // Ensure phone number always has + at the beginning and is displayed properly
        let displayPhone = phoneValue
        if (!displayPhone.startsWith('+')) {
          displayPhone = `+${displayPhone}`
        }

        return (
          <Typography
            sx={{
              color: 'text.secondary',
              direction: 'ltr', // Force LTR for phone numbers to ensure + is at the start
              textAlign: isRTL ? 'right' : 'left',
              unicodeBidi: 'plaintext' // Ensure proper text direction handling
            }}
          >
            {displayPhone}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'roleId',
      minWidth: 150,
      headerName: t('Role'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the role name for filtering
        let roleName = t('N/A')

        if (row.role && typeof row.role === 'object') {
          roleName = locale === 'ar' ? row.role.nameAr || row.role.nameEn : row.role.nameEn || row.role.nameAr
        } else if (row.roleId && typeof row.roleId === 'object') {
          roleName = locale === 'ar' ? row.roleId.nameAr || row.roleId.nameEn : row.roleId.nameEn || row.roleId.nameAr
        } else if (row.roleId) {
          const role = safeRoles.find((r: any) => r._id === row.roleId)
          if (role) {
            roleName = locale === 'ar' ? role.nameAr || role.nameEn : role.nameEn || role.nameAr
          }
        }

        return roleName
      },
      renderCell: ({ row }: any) => {
        let roleName = t('N/A')

        if (row.role && typeof row.role === 'object') {
          roleName = locale === 'ar' ? row.role.nameAr || row.role.nameEn : row.role.nameEn || row.role.nameAr
        } else if (row.roleId && typeof row.roleId === 'object') {
          roleName = locale === 'ar' ? row.roleId.nameAr || row.roleId.nameEn : row.roleId.nameEn || row.roleId.nameAr
        } else if (row.roleId) {
          const role = safeRoles.find((r: any) => r._id === row.roleId)
          if (role) {
            roleName = locale === 'ar' ? role.nameAr || role.nameEn : role.nameEn || role.nameAr
          }
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar
              skin='light'
              sx={{ mr: 2, width: 24, height: 24 }}
              color={userRoleObj[roleName?.toLowerCase()]?.color || 'primary'}
            >
              <Icon icon={userRoleObj[roleName?.toLowerCase()]?.icon || 'tabler:user'} fontSize={14} />
            </CustomAvatar>
            <Typography
              sx={{
                color: 'text.secondary',
                textTransform: 'capitalize',
                lineHeight: 1.2,
                alignSelf: 'center'
              }}
            >
              {safeString(roleName, t)}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'company',
      headerName: t('Company'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the company name for filtering
        let companyName = t('N/A')

        if (row.companyId && typeof row.companyId === 'object') {
          companyName =
            locale === 'ar'
              ? row.companyId.nameAr || row.companyId.nameEn
              : row.companyId.nameEn || row.companyId.nameAr
        } else if (row.companyId && typeof row.companyId === 'string') {
          const company = companies.find((c: any) => c._id === row.companyId)
          if (company) {
            companyName = locale === 'ar' ? company.nameAr || company.nameEn : company.nameEn || company.nameAr
          }
        } else if (row.company && typeof row.company === 'object') {
          companyName =
            locale === 'ar' ? row.company.nameAr || row.company.nameEn : row.company.nameEn || row.company.nameAr
        } else if (row.company && typeof row.company === 'string') {
          const company = companies.find((c: any) => c._id === row.company)
          if (company) {
            companyName = locale === 'ar' ? company.nameAr || company.nameEn : company.nameEn || company.nameAr
          }
        }

        return companyName
      },
      renderCell: ({ row }: any) => {
        let companyName = t('N/A')

        if (row.companyId && typeof row.companyId === 'object') {
          companyName =
            locale === 'ar'
              ? row.companyId.nameAr || row.companyId.nameEn
              : row.companyId.nameEn || row.companyId.nameAr
        } else if (row.companyId && typeof row.companyId === 'string') {
          const company = companies.find((c: any) => c._id === row.companyId)
          if (company) {
            companyName = locale === 'ar' ? company.nameAr || company.nameEn : company.nameEn || company.nameAr
          }
        } else if (row.company && typeof row.company === 'object') {
          companyName =
            locale === 'ar' ? row.company.nameAr || row.company.nameEn : row.company.nameEn || row.company.nameAr
        } else if (row.company && typeof row.company === 'string') {
          const company = companies.find((c: any) => c._id === row.company)
          if (company) {
            companyName = locale === 'ar' ? company.nameAr || company.nameEn : company.nameEn || company.nameAr
          }
        }

        return <Typography sx={{ color: 'text.secondary' }}>{companyName}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'jobTitle',
      headerName: t('Job Title'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the job title name for filtering
        let jobTitleName = t('N/A')

        if (row.jobTitleId && typeof row.jobTitleId === 'object') {
          jobTitleName =
            locale === 'ar'
              ? row.jobTitleId.nameAr || row.jobTitleId.nameEn
              : row.jobTitleId.nameEn || row.jobTitleId.nameAr
        } else if (row.jobTitleId && typeof row.jobTitleId === 'string') {
          const jobTitle = jobTitles.find((jt: any) => jt._id === row.jobTitleId)
          if (jobTitle) {
            jobTitleName = locale === 'ar' ? jobTitle.nameAr || jobTitle.nameEn : jobTitle.nameEn || jobTitle.nameAr
          }
        } else if (row.jobTitle && typeof row.jobTitle === 'object') {
          jobTitleName =
            locale === 'ar' ? row.jobTitle.nameAr || row.jobTitle.nameEn : row.jobTitle.nameEn || row.jobTitle.nameAr
        } else if (row.jobTitle && typeof row.jobTitle === 'string') {
          const jobTitle = jobTitles.find((jt: any) => jt._id === row.jobTitle)
          if (jobTitle) {
            jobTitleName = locale === 'ar' ? jobTitle.nameAr || jobTitle.nameEn : jobTitle.nameEn || jobTitle.nameAr
          }
        }

        return jobTitleName
      },
      renderCell: ({ row }: any) => {
        let jobTitleName = t('N/A')

        if (row.jobTitleId && typeof row.jobTitleId === 'object') {
          jobTitleName =
            locale === 'ar'
              ? row.jobTitleId.nameAr || row.jobTitleId.nameEn
              : row.jobTitleId.nameEn || row.jobTitleId.nameAr
        } else if (row.jobTitleId && typeof row.jobTitleId === 'string') {
          const jobTitle = jobTitles.find((jt: any) => jt._id === row.jobTitleId)
          if (jobTitle) {
            jobTitleName = locale === 'ar' ? jobTitle.nameAr || jobTitle.nameEn : jobTitle.nameEn || jobTitle.nameAr
          }
        } else if (row.jobTitle && typeof row.jobTitle === 'object') {
          jobTitleName =
            locale === 'ar' ? row.jobTitle.nameAr || row.jobTitle.nameEn : row.jobTitle.nameEn || row.jobTitle.nameAr
        } else if (row.jobTitle && typeof row.jobTitle === 'string') {
          const jobTitle = jobTitles.find((jt: any) => jt._id === row.jobTitle)
          if (jobTitle) {
            jobTitleName = locale === 'ar' ? jobTitle.nameAr || jobTitle.nameEn : jobTitle.nameEn || jobTitle.nameAr
          }
        }

        return <Typography sx={{ color: 'text.secondary' }}>{jobTitleName}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'departmentId',
      headerName: t('Department'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the department name for filtering
        let departmentName = t('N/A')

        if (row.departmentId && typeof row.departmentId === 'object') {
          departmentName =
            locale === 'ar'
              ? row.departmentId.nameAr || row.departmentId.nameEn
              : row.departmentId.nameEn || row.departmentId.nameAr
        } else if (row.departmentId && typeof row.departmentId === 'string') {
          // If it's just an ID, we can't display the name without fetching departments
          departmentName = t('N/A')
        } else if (row.department && typeof row.department === 'object') {
          departmentName =
            locale === 'ar'
              ? row.department.nameAr || row.department.nameEn
              : row.department.nameEn || row.department.nameAr
        } else if (row.department && typeof row.department === 'string') {
          // If it's just an ID, we can't display the name without fetching departments
          departmentName = t('N/A')
        }

        return departmentName
      },
      renderCell: ({ row }: any) => {
        let departmentName = t('N/A')

        if (row.departmentId && typeof row.departmentId === 'object') {
          departmentName =
            locale === 'ar'
              ? row.departmentId.nameAr || row.departmentId.nameEn
              : row.departmentId.nameEn || row.departmentId.nameAr
        } else if (row.departmentId && typeof row.departmentId === 'string') {
          // If it's just an ID, we can't display the name without fetching departments
          departmentName = t('N/A')
        } else if (row.department && typeof row.department === 'object') {
          departmentName =
            locale === 'ar'
              ? row.department.nameAr || row.department.nameEn
              : row.department.nameEn || row.department.nameAr
        } else if (row.department && typeof row.department === 'string') {
          // If it's just an ID, we can't display the name without fetching departments
          departmentName = t('N/A')
        }

        return <Typography sx={{ color: 'text.secondary' }}>{departmentName}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'isActive',
      headerName: t('Status'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the status for filtering
        return row.isActive === true ? t('Active') : t('Inactive')
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
      flex: 1,
      minWidth: 150,
      field: 'createdAt',
      headerName: t('Created At'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the formatted date for filtering to match what's displayed
        return formatDate(row.createdAt)
      },
      renderCell: ({ row }: any) => {
        return <Typography sx={{ color: 'text.secondary' }}>{formatDate(row.createdAt)}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'createdBy',
      headerName: t('Created By'),
      sortable: true,
      valueGetter: ({ row }: any) => {
        // Use the createdBy name for filtering
        let createdBy = t('System')

        if (typeof row.createdBy === 'object' && row.createdBy !== null) {
          createdBy =
            locale === 'ar'
              ? row.createdBy.nameAr || row.createdBy.nameEn || row.createdBy.username || t('System')
              : row.createdBy.nameEn || row.createdBy.nameAr || row.createdBy.username || t('System')
        } else if (row.createdBy) {
          createdBy = safeString(row.createdBy, t)
        }

        return createdBy
      },
      renderCell: ({ row }: any) => {
        let createdBy = 'System'

        if (typeof row.createdBy === 'object' && row.createdBy !== null) {
          createdBy =
            locale === 'ar'
              ? row.createdBy.nameAr || row.createdBy.nameEn || row.createdBy.username || t('System')
              : row.createdBy.nameEn || row.createdBy.nameAr || row.createdBy.username || t('System')
        } else if (row.createdBy) {
          createdBy = safeString(row.createdBy, t)
        }

        return <Typography sx={{ color: 'text.secondary' }}>{createdBy}</Typography>
      }
    },
    {
      flex: 1,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerName: t('Actions'),
      renderCell: ({ row }: any) => (
        <RowOptions
          id={row._id}
          onEdit={handleEditUser}
          onView={handleViewUser}
          onDelete={handleDeleteUser}
          onHistory={handleViewHistory}
          t={t}
          isRTL={isRTL}
        />
      )
    }
  ]

  // Check if user has permission to view users
  if (!canViewUser) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          {t('Access denied - Insufficient permissions')}
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6.5} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Statistics Cards - Only Active and Inactive */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {statsHorizontalWithDetails.map((item, index) => (
            <Grid item xs={12} md={6} sm={6} key={index}>
              <CardStatsHorizontalWithDetails {...item} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title={t('Filter')} />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='role-select'>{t('Select Role')}</InputLabel>
                  <Select
                    fullWidth
                    value={filters.role}
                    id='select-role'
                    label={t('Select Role')}
                    labelId='role-select'
                    onChange={handleRoleChange}
                    inputProps={{ placeholder: t('Select Role') }}
                  >
                    <MenuItem value=''>{t('All Roles')}</MenuItem>
                    {safeRoles.map((role: any) => (
                      <MenuItem key={role._id} value={role._id}>
                        {safeString(role.nameEn || role.nameAr, t)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>{t('Select Status')}</InputLabel>
                  <Select
                    fullWidth
                    value={filters.status}
                    id='select-status'
                    label={t('Select Status')}
                    labelId='status-select'
                    onChange={handleStatusChange}
                    inputProps={{ placeholder: t('Select Status') }}
                  >
                    <MenuItem value='all'>{t('All Status')}</MenuItem>
                    <MenuItem value='true'>{t('Active')}</MenuItem>
                    <MenuItem value='false'>{t('Inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider sx={{ m: '0 !important' }} />

          {/* Table Header with Search and Add Button */}
          <TableHeader
            value={value}
            handleFilter={handleFilter}
            toggle={toggleAddUserDrawer}
            selectedRows={selectedRows}
            onBulkAction={handleBulkAction}
            onShowAllColumns={
              Object.keys(columnVisibilityModel).some(key => !columnVisibilityModel[key])
                ? handleShowAllColumns
                : undefined
            }
            canCreate={canCreateUser}
            canUpdate={canUpdateUser}
            canDelete={canDeleteUser}
          />

          {/* Data Grid */}
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={safeUsers}
            columns={columns}
            pageSize={pageSize}
            page={pagination?.current ? pagination.current - 1 : 0}
            rowCount={pagination?.total || 0}
            paginationMode='server'
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={newSelection => setSelectedRows(newSelection)}
            selectionModel={selectedRows}
            rowsPerPageOptions={[10, 25, 50]}
            localeText={{ noRowsLabel: t('No Records Found') }}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            onPageChange={newPage => {
              if (pagination) {
                getUsers({
                  page: newPage + 1,
                  limit: pageSize,
                  search: debouncedValue,
                  ...(filters.role && { roleId: filters.role }),
                  ...(filters.status &&
                    filters.status !== 'all' && { status: filters.status === 'true' ? 'active' : 'inactive' })
                })
              }
            }}
            getRowId={row => row._id}
            loading={loading}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            disableColumnMenu={false}
            sx={{
              border: 0,
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              },
              '& .MuiDataGrid-columnHeader': {
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }
            }}
          />
        </Card>
      </Grid>

      {/* User Modal */}
      <UserModal
        mode={modalMode}
        open={showUserModal}
        userId={selectedUser?._id || ''}
        toggle={closeUserModal}
        initialUserData={selectedUser}
      />

      {/* User History Modal */}
      <UserHistoryModal
        open={showHistoryModal}
        toggle={closeHistoryModal}
        userId={selectedUser?._id || ''}
        userName={selectedUser?.nameEn || selectedUser?.nameAr || selectedUser?.username || ''}
      />

      {/* Single User Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={`${t('Delete')} ${t('User')}`}
        description={t('Are you sure you want to delete this user? This action cannot be undone.')}
        btnName={t('Delete')}
        onClick={confirmDeleteUser}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={showBulkDeleteModal}
        toggle={() => setShowBulkDeleteModal(false)}
        mode={`${t('Delete')} ${t('Users')}`}
        description={`${t('Are you sure you want to delete %s user(s)? This action cannot be undone.').replace(
          '%s',
          selectedRows.length.toString()
        )}`}
        btnName={selectedRows.length === 1 ? t('Delete') : t('Delete All')}
        onClick={confirmBulkDelete}
      />
    </Grid>
  )
}

Users.acl = {
  subject: 'user-management',
  action: 'view'
}

export default Users
