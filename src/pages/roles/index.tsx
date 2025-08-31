// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FallbackSpinner from 'src/@core/components/spinner'

// ** Store Imports
import useRoleStore from 'src/store/useRoleStore'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Component Imports
import RoleCards from './components/RoleCards'
import RoleTable from './components/RoleTable'
import RoleModal from './components/RoleModal'
import RoleHistoryModal from './components/RoleHistoryModal'

// ** Types
import { IRole } from 'src/types/role'

// ** Translation Imports
import { useTranslation } from 'react-i18next'

// ** Utils
import { getRoleDisplayName } from 'src/utils/multilingual'

const Roles = () => {
  const { i18n } = useTranslation()
  const {
    roles,
    loading,
    error,
    pagination,
    getRoles
  } = useRoleStore()

  // ** States
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [filters, setFilters] = useState({
    status: ''
  })
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyRole, setHistoryRole] = useState<IRole | null>(null)

  // ** Debounce search value to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchValue])

  // ** Effects - Direct API calls to avoid dependency issues
  useEffect(() => {
    getRoles({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchValue,
      ...(filters.status && { isActive: filters.status === 'true' })
    })
  }, [getRoles, pageSize, debouncedSearchValue, filters.status, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1) // DataGrid uses 0-based indexing
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleEditRole = (role: IRole) => {
    setSelectedRole(role)
    setModalMode('edit')
    setShowRoleModal(true)
  }

  const handleViewRole = (role: IRole) => {
    setSelectedRole(role)
    setModalMode('view')
    setShowRoleModal(true)
  }

  const handleCloseModal = () => {
    setShowRoleModal(false)
    setSelectedRole(null)
  }

  const handleViewHistory = (role: IRole) => {
    setHistoryRole(role)
    setShowHistoryModal(true)
  }

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false)
    setHistoryRole(null)
  }

  const handleSaveRole = (updatedRole: IRole) => {
    // Refresh the roles list after update
    getRoles({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchValue,
      ...(filters.status && { isActive: filters.status === 'true' })
    })
  }

  if (loading && roles.length === 0) {
    return <FallbackSpinner />
  }

  if (error && roles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <RoleCards roles={roles} />
      </Grid>
      <Grid item xs={12}>
        <RoleTable
          roles={roles}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEditRole={handleEditRole}
          onViewRole={handleViewRole}
          onViewHistory={handleViewHistory}
        />
      </Grid>

      {/* Role Modal */}
      <RoleModal
        open={showRoleModal}
        role={selectedRole}
        mode={modalMode}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
      />

      {/* Role History Modal */}
      <RoleHistoryModal
        open={showHistoryModal}
        toggle={handleCloseHistoryModal}
        roleId={historyRole?._id || ''}
        roleName={historyRole ? getRoleDisplayName(historyRole, i18n.language) : ''}
      />
    </Grid>
  )
}

// ** ACL Configuration
Roles.acl = {
  subject: 'roles',
  action: 'read'
}

export default Roles
