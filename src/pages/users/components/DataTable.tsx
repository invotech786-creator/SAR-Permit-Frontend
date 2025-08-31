import { ChangeEvent, FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'

// ** Custom Imports
import Icon from 'src/@core/components/icon'
import DefaultPalette from 'src/@core/theme/palette'
import UserModal from './UserModal'
import { ConfirmationModal } from 'src/components'
import { IUser } from 'src/types'
import { useUserStore } from 'src/store'
import { Card } from '@mui/material'

interface Column {
  id: 'name' | 'role' | 'email' | 'phone' | 'username' | 'createdBy' | 'actions'
  label: string
  minWidth?: number
  align?: 'right'
  format?: (value: string | number) => string
}

interface Props {
  data: any[]
  page: number
  rowsPerPage: number
  onHandlePageChange: (event: unknown, newPage: number) => void
  onHandleRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void
  trigger: () => void
  totalPages: number
}

type IMode = 'Add' | 'Edit' | 'View'

const DataTable: FC<Props> = ({
  data,
  page,
  rowsPerPage,
  totalPages,
  onHandlePageChange,
  onHandleRowsPerPageChange,
  trigger
}) => {
  const { i18n } = useTranslation()
  const { deleteUser } = useUserStore()

  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState<IUser | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mode, setMode] = useState<IMode>('Edit')

  const columns: readonly Column[] = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'role', label: 'Role', minWidth: 130 },
    { id: 'email', label: 'Email', minWidth: 170 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'username', label: 'Username', minWidth: 130 },
    { id: 'createdBy', label: 'Created By', minWidth: 150 },
    { id: 'actions', label: 'Actions', minWidth: 100 }
  ]

  const handleDeleteClick = async () => {
    await deleteUser(user?._id || '')
    trigger()
    setShowDeleteModal(false)
  }

  return (
    <Card>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} align={column.align} sx={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                {columns.map(column => {
                  let value: any = ''

                  switch (column.id) {
                    case 'name':
                      value = i18n.language === 'ar' ? row.nameAr : row.nameEn
                      break
                    case 'role':
                      value = row.roleId?.nameEn || '-'
                      break
                    case 'createdBy':
                      value = row.createdBy?.nameEn || '-'
                      break
                    case 'actions':
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <Icon
                            color={DefaultPalette('light', 'default').primary.dark}
                            style={{ marginRight: '10px', cursor: 'pointer' }}
                            icon='mdi:eye'
                            fontSize={20}
                            onClick={() => {
                              setMode('View')
                              setUser(row)
                              setShowModal(true)
                            }}
                          />
                          <Icon
                            color={DefaultPalette('light', 'default').primary.dark}
                            style={{ marginRight: '10px', cursor: 'pointer' }}
                            icon='tabler:edit'
                            fontSize={20}
                            onClick={() => {
                              setMode('Edit')
                              setUser(row)
                              setShowModal(true)
                            }}
                          />
                          <Icon
                            color='red'
                            icon='tabler:trash-filled'
                            style={{ cursor: 'pointer' }}
                            fontSize={20}
                            onClick={() => {
                              setUser(row)
                              setShowDeleteModal(true)
                            }}
                          />
                        </TableCell>
                      )
                    default:
                      value = row[column.id]
                  }

                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format && typeof value === 'number' ? column.format(value) : value ?? '-'}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component='div'
        count={totalPages}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onHandlePageChange}
        onRowsPerPageChange={onHandleRowsPerPageChange}
      />

      {showDeleteModal && (
        <ConfirmationModal
          open={showDeleteModal}
          toggle={() => setShowDeleteModal(!showDeleteModal)}
          mode='Warning'
          description='Are you sure you want to delete this user?'
          btnName='Delete'
          onClick={handleDeleteClick}
        />
      )}

      {showModal && (
        <UserModal
          open={showModal}
          toggle={() => {
            setShowModal(false)
            trigger()
          }}
          userId={user?._id}
          mode={mode}
        />
      )}
    </Card>
  )
}

export default DataTable
