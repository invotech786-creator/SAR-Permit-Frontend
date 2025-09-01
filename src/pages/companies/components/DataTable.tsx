import { ChangeEvent, FC, useState } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'

// ** Other Imports
import Icon from 'src/@core/components/icon'
import DefaultPalette from 'src/@core/theme/palette'
import CompanyModal from './CompanyModal'

import { ConfirmationModal } from 'src/components'
import { ICompany } from 'src/types'
import { useTranslation } from 'react-i18next'

interface Column {
  id: 'name' | 'email' | 'phone' | 'address' | 'actions'
  label: string
  minWidth?: number
  align?: 'right'
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 170 },
  { id: 'phone', label: 'Phone', minWidth: 130 },
  { id: 'address', label: 'Address', minWidth: 200 },
  { id: 'actions', label: 'Actions', minWidth: 100 }
]

interface Props {
  data: ICompany[]
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
  const [showModal, setShowModal] = useState(false)
  const [company, setCompany] = useState<ICompany | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mode, setMode] = useState<IMode>('Edit')

  const {
    i18n: { language }
  } = useTranslation()

  const handleDeleteClick = async () => {
    // TODO: Add your delete logic here
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label='company table'>
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
                <TableCell>{language === 'ar' ? row.nameAr : row.nameEn}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{language === 'ar' ? row.address_ar : row.address}</TableCell>
                <TableCell>
                  <Icon
                    color={DefaultPalette('light', 'default').primary.dark}
                    icon='mdi:eye'
                    fontSize={20}
                    style={{ marginRight: 10, cursor: 'pointer' }}
                    onClick={() => {
                      setMode('View')
                      setCompany(row)
                      setShowModal(true)
                    }}
                  />
                  <Icon
                    color={DefaultPalette('light', 'default').primary.dark}
                    icon='tabler:edit'
                    fontSize={20}
                    style={{ marginRight: 10, cursor: 'pointer' }}
                    onClick={() => {
                      setMode('Edit')
                      setCompany(row)
                      setShowModal(true)
                    }}
                  />
                  <Icon
                    color='red'
                    icon='tabler:trash-filled'
                    fontSize={20}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setCompany(row)
                      setShowDeleteModal(true)
                    }}
                  />
                </TableCell>
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
        labelDisplayedRows={({ from, to, count }) =>
          language === 'ar'
            ? `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
        labelRowsPerPage={language === 'ar' ? 'صفوف في الصفحة:' : 'Rows per page:'}
      />

      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode='Warning'
        description='Are you sure you want to delete this company?'
        btnName='Delete'
        onClick={handleDeleteClick}
      />

      {showModal && company && (
        <CompanyModal
          open={showModal}
          toggle={() => {
            setShowModal(false)
            trigger()
          }}
          company={company}
          mode={mode}
        />
      )}
    </>
  )
}

export default DataTable
