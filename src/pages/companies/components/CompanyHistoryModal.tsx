import { FC, useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import CloseIcon from '@mui/icons-material/Close'
import FallbackSpinner from 'src/@core/components/spinner'
import useRevisionStore from 'src/store/useRevisionStore'
import { IRevision } from 'src/types'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  toggle: () => void
  companyId: string
  companyName: string
}

const CompanyHistoryModal: FC<Props> = ({ open, toggle, companyId, companyName }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { getEntityHistory, loading } = useRevisionStore()
  const [revisions, setRevisions] = useState<IRevision[]>([])

  useEffect(() => {
    if (open && companyId) {
      fetchHistory()
    }
  }, [open, companyId])

  const fetchHistory = async () => {
    const history = await getEntityHistory('Company', companyId)
    setRevisions(history)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'success'
      case 'edit':
        return 'warning'
      case 'delete':
        return 'error'
      default:
        return 'default'
    }
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'tabler:plus'
      case 'edit':
        return 'tabler:edit'
      case 'delete':
        return 'tabler:trash'
      default:
        return 'tabler:history'
    }
  }

  const formatFieldValue = (fieldName: string, value: any) => {
    if (value === null || value === undefined) return t('N/A')

    switch (fieldName) {
      case 'isActive':
        return value ? t('Active') : t('Inactive')
      case 'isDeleted':
        return value ? t('Deleted') : t('Not Deleted')
      case 'createdAt':
      case 'updatedAt':
        return value ? new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : t('N/A')
      case 'nameAr':
      case 'nameEn':
      case 'phone':
      case 'email':
      case 'address':
      case 'address_ar':
        return value || t('N/A')
      default:
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }
  }

  const getUserName = (modifiedBy: any) => {
    if (typeof modifiedBy === 'object' && modifiedBy) {
      const locale = i18n.language || 'en'
      return locale === 'ar'
        ? modifiedBy.nameAr || modifiedBy.nameEn || modifiedBy.username
        : modifiedBy.nameEn || modifiedBy.nameAr || modifiedBy.username
    }
    return t('System')
  }

  const getFieldDisplayName = (fieldName: string) => {
    switch (fieldName) {
      case 'nameAr':
        return t('Name (Arabic)')
      case 'nameEn':
        return t('Name (English)')
      case 'address_ar':
        return t('Address (Arabic)')
      case 'isActive':
        return t('Status')
      case 'isDeleted':
        return t('Deleted Status')
      case 'createdAt':
        return t('Created Date')
      case 'updatedAt':
        return t('Updated Date')
      case 'createdBy':
        return t('Created By')
      default:
        return fieldName?.charAt(0).toUpperCase() + fieldName?.slice(1) || t('Field')
    }
  }

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={toggle} sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
        <Icon icon='tabler:history' style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }} />
        {t('Company History')}: {companyName}
        <IconButton
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: isRTL ? 'auto' : theme => theme.spacing(2),
            left: isRTL ? theme => theme.spacing(2) : 'auto',
            top: theme => theme.spacing(2),
            color: theme => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: '500px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <FallbackSpinner />
          </Box>
        ) : revisions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant='h6' color='text.secondary'>
              {t('No revision history found')}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Operation')}</TableCell>
                  <TableCell>{t('Field')}</TableCell>
                  <TableCell>{t('Previous Value')}</TableCell>
                  <TableCell>{t('New Value')}</TableCell>
                  <TableCell>{t('Modified By')}</TableCell>
                  <TableCell>{t('Date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revisions.map(revision => (
                  <TableRow key={revision._id}>
                    <TableCell>
                      <Chip
                        label={revision.operation.toUpperCase()}
                        color={getOperationColor(revision.operation) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{getFieldDisplayName(revision.fieldName || 'All Fields')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{
                          backgroundColor:
                            revision.operation === 'edit'
                              ? theme => (theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#ffebee')
                              : 'transparent',
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8125rem',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {revision.operation === 'create'
                          ? '-'
                          : revision.operation === 'delete'
                          ? t('Existed')
                          : formatFieldValue(revision.fieldName || '', revision.previousValue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{
                          backgroundColor: theme => {
                            const isDark = theme.palette.mode === 'dark'
                            if (revision.operation === 'edit') {
                              return isDark ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e8'
                            } else if (revision.operation === 'create') {
                              return isDark ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e8'
                            } else if (revision.operation === 'delete') {
                              return isDark ? 'rgba(244, 67, 54, 0.1)' : '#ffebee'
                            }
                            return 'transparent'
                          },
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8125rem',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {revision.operation === 'create'
                          ? t('Initial Data')
                          : revision.operation === 'delete'
                          ? t('Deleted')
                          : formatFieldValue(revision.fieldName || '', revision.currentValue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{getUserName(revision.modifiedBy)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatDate(revision.modificationDate)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
        <Button
          onClick={toggle}
          variant='outlined'
          color='inherit'
          sx={{
            color: '#888',
            borderColor: '#888',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#888'
            }
          }}
        >
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompanyHistoryModal
