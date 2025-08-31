import { FC, useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  useTheme,
  Backdrop
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import { IDepartment } from 'src/types'
import { useDepartmentStore } from 'src/store'
import FallbackSpinner from 'src/@core/components/spinner'

interface Props {
  open: boolean
  toggle: () => void
  departments: IDepartment[]
  onSequenceUpdate?: (departments: IDepartment[]) => void
}

const DepartmentSequenceModal: FC<Props> = ({ open, toggle, departments, onSequenceUpdate }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const theme = useTheme()
  const { updateDepartmentSequences } = useDepartmentStore()
  const [orderedDepartments, setOrderedDepartments] = useState<IDepartment[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && departments.length > 0) {
      setOrderedDepartments([...departments])
      setHasChanges(false)
    }
  }, [open, departments])

  const moveDepartment = (fromIndex: number, toIndex: number) => {
    const newOrder = [...orderedDepartments]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)
    setOrderedDepartments(newOrder)
    setHasChanges(true)
  }

  const moveUp = (index: number) => {
    if (index > 0) {
      moveDepartment(index, index - 1)
    }
  }

  const moveDown = (index: number) => {
    if (index < orderedDepartments.length - 1) {
      moveDepartment(index, index + 1)
    }
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setLoading(true)
    try {
      // Prepare the updates array for the API
      const updates = orderedDepartments.map((department, index) => ({
        departmentId: department._id,
        sequence: index + 1
      }))

      // Call the API to update sequences
      const success = await updateDepartmentSequences(updates)

      if (success) {
        // Call the callback if provided
        if (onSequenceUpdate) {
          onSequenceUpdate(orderedDepartments)
        }
        toggle()
      }
    } catch (error) {
      console.error('Error updating department sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentName = (department: IDepartment) => {
    const currentLocale = i18n.language
    if (currentLocale === 'ar') {
      return department.nameAr || department.nameEn || t('Unnamed Department')
    }
    return department.nameEn || department.nameAr || t('Unnamed Department')
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={toggle}
      PaperProps={{
        sx: {
          direction: isRTL ? 'rtl' : 'ltr'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h6' component='span'>
            {t('Update Department Sequence')}
          </Typography>
          <IconButton size='small' onClick={toggle} sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {t('Drag and drop departments to reorder them, or use the up/down arrows to change their sequence.')}
        </Typography>

        <Paper elevation={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List>
            {orderedDepartments.map((department, index) => (
              <ListItem
                key={department._id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size='small'
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      sx={{
                        color: index === 0 ? 'text.disabled' : 'primary.main',
                        '&:hover': {
                          backgroundColor: index === 0 ? 'transparent' : 'primary.light'
                        }
                      }}
                    >
                      <Icon icon='tabler:chevron-up' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={() => moveDown(index)}
                      disabled={index === orderedDepartments.length - 1}
                      sx={{
                        color: index === orderedDepartments.length - 1 ? 'text.disabled' : 'primary.main',
                        '&:hover': {
                          backgroundColor: index === orderedDepartments.length - 1 ? 'transparent' : 'primary.light'
                        }
                      }}
                    >
                      <Icon icon='tabler:chevron-down' />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {index + 1}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={getDepartmentName(department)}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('Status')}:
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: department.isActive ? 'success.light' : 'error.light',
                          color: department.isActive ? 'success.dark' : 'error.dark',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {department.isActive ? t('Active') : t('Inactive')}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Button onClick={toggle} variant='outlined' color='secondary' type='button'>
          {t('Cancel')}
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={!hasChanges || loading}>
          {t('Save Sequence')}
        </Button>
      </DialogActions>

      {/* Loading Overlay */}
      <Backdrop
        sx={{
          color: '#00778B',
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'transparent'
        }}
        open={loading}
      >
        <FallbackSpinner />
      </Backdrop>
    </Dialog>
  )
}

export default DepartmentSequenceModal
