// ** React Imports
import { ChangeEvent, FC, useState } from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'

import Icon from 'src/@core/components/icon'
import DefaultPalette from 'src/@core/theme/palette'
import JobtitleModal from './JobTitleModal'
import { ConfirmationModal } from 'src/components'
import { IJobTitle } from 'src/types'
import { useTranslation } from 'react-i18next'

interface Column {
  id: 'name' | 'actions'
  label: string
  minWidth?: number
  align?: 'right'
  format?: (value: string | number) => string
}

// Define columns dynamically with translation
const getColumns = (t: any): readonly Column[] => [
  { id: 'name', label: t('Name'), minWidth: 170 },
  { id: 'actions', label: t('Actions'), minWidth: 170 }
]

interface Props {
  data: IJobTitle[]
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
  const [jobTitle, setJobTitle] = useState<IJobTitle | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mode, setMode] = useState<IMode>('Edit')

  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const language = i18n.language
  const columns = getColumns(t)

  //   const permissions = useMemo(() => getScreenPermissions('customers'), [])

  const deleteJobTitle = async () => {
    // const response: any = await Network.delete(`${Urls.manageJobTitles}/${jobTitle?._id}`)
    // if (response.ok) {
    // showSuccessMessage('Job Title deleted successfully')
    // }
    setShowDeleteModal(false)
    trigger()
  }

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <TableContainer sx={{ maxHeight: 440 }}>
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
              {data.map(row => {
                return (
                  <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                    {columns.map(column => {
                      if (column.id === 'name') {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {language === 'ar' ? row.nameAr : row.nameEn}
                          </TableCell>
                        )
                      } else if (column.id === 'actions') {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Icon
                              color={DefaultPalette('light', 'default').primary.dark}
                              style={{ 
                                marginRight: isRTL ? 0 : '10px', 
                                marginLeft: isRTL ? '10px' : 0, 
                                cursor: 'pointer' 
                              }}
                              icon='mdi:eye'
                              fontSize={20}
                              onClick={() => {
                                setMode('View')
                                setJobTitle(row)
                                setShowModal(!showModal)
                              }}
                            />
                            {/* )} */}
                            {/* {permissions.includes('edit') && ( */}
                            <Icon
                              color={DefaultPalette('light', 'default').primary.dark}
                              style={{ 
                                marginRight: isRTL ? 0 : '10px', 
                                marginLeft: isRTL ? '10px' : 0, 
                                cursor: 'pointer' 
                              }}
                              icon='tabler:edit'
                              fontSize={20}
                              onClick={() => {
                                setMode('Edit')
                                setJobTitle(row)
                                setShowModal(!showModal)
                              }}
                            />
                            {/* )} */}
                            {/* {permissions.includes('delete') && ( */}
                            <Icon
                              color={DefaultPalette('light', 'default').primary.dark}
                              style={{ cursor: 'pointer' }}
                              icon='tabler:trash'
                              fontSize={20}
                              onClick={() => {
                                setJobTitle(row)
                                setShowDeleteModal(!showDeleteModal)
                              }}
                            />
                            {/* )} */}
                          </TableCell>
                        )
                      }

                      return null
                    })}
                  </TableRow>
                )
              })}
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
      </Paper>
      <ConfirmationModal
        open={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        mode={`${t('Delete')} ${t('Job Title')}`}
        description={t('Are you sure you want to delete this job title? This action cannot be undone.')}
        onClick={deleteJobTitle}
        btnName={t('Delete')}
      />
      <JobtitleModal
        open={showModal}
        toggle={() => {
          setShowModal(!showModal)
          trigger()
        }}
        jobTitle={jobTitle}
        mode={mode}
      />
    </>
  )
}

export default DataTable
