import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { IDepartment, IUser } from 'src/types'

interface PermitFilterDialogProps {
  open: boolean
  onClose: () => void
  onApply: (filters: PermitFilters) => void
  onReset: () => void
  currentFilters: PermitFilters
  departments: IDepartment[]
  users: IUser[]
}

export interface PermitFilters {
  type?: string
  workPermitType?: string
  startDate?: string
  endDate?: string
  createdAtFrom?: string
  createdAtTo?: string
  number?: string
  purpose?: string
  createdBy?: string
  responsibleId?: string
}

interface LocalFilters {
  type?: string
  workPermitType?: string
  permitDurationFrom?: string
  permitDurationTo?: string
  additionDateFrom?: string
  additionDateTo?: string
  workPermitNumber?: string
  purpose?: string
  addedBy?: string
  responsiblePerson?: string
}

const PermitFilterDialog: React.FC<PermitFilterDialogProps> = ({
  open,
  onClose,
  onApply,
  onReset,
  currentFilters,
  departments,
  users
}) => {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    type: currentFilters.type || '',
    workPermitType: currentFilters.workPermitType || '',
    permitDurationFrom: currentFilters.startDate || '',
    permitDurationTo: currentFilters.endDate || '',
    additionDateFrom: currentFilters.createdAtFrom || '',
    additionDateTo: currentFilters.createdAtTo || '',
    workPermitNumber: currentFilters.number || '',
    purpose: currentFilters.purpose || '',
    addedBy: currentFilters.createdBy || '',
    responsiblePerson: currentFilters.responsibleId || ''
  })

  useEffect(() => {
    if (open) {
      setLocalFilters({
        type: currentFilters.type || '',
        workPermitType: currentFilters.workPermitType || '',
        permitDurationFrom: currentFilters.startDate || '',
        permitDurationTo: currentFilters.endDate || '',
        additionDateFrom: currentFilters.createdAtFrom || '',
        additionDateTo: currentFilters.createdAtTo || '',
        workPermitNumber: currentFilters.number || '',
        purpose: currentFilters.purpose || '',
        addedBy: currentFilters.createdBy || '',
        responsiblePerson: currentFilters.responsibleId || ''
      })
    }
  }, [open, currentFilters])

  const handleFilterChange = (field: keyof LocalFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleReset = () => {
    const emptyFilters: LocalFilters = {}
    setLocalFilters(emptyFilters)
    onReset()
  }

  const handleApply = () => {
    // Map the local filters to API filter format
    const apiFilters: PermitFilters = {
      type: localFilters.type || undefined,
      workPermitType: localFilters.workPermitType || undefined,
      startDate: localFilters.permitDurationFrom || undefined,
      endDate: localFilters.permitDurationTo || undefined,
      createdAtFrom: localFilters.additionDateFrom || undefined,
      createdAtTo: localFilters.additionDateTo || undefined,
      number: localFilters.workPermitNumber || undefined,
      purpose: localFilters.purpose || undefined,
      createdBy: localFilters.addedBy || undefined,
      responsibleId: localFilters.responsiblePerson || undefined
    }

    onApply(apiFilters)
    onClose()
  }

  const handleClose = () => {
    setLocalFilters(currentFilters)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Typography variant='h6' component='div'>
          {t('Filter Permits')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('Work Permit Type')}</InputLabel>
              <Select
                value={localFilters.workPermitType || ''}
                onChange={e => handleFilterChange('workPermitType', e.target.value)}
                label={t('Work Permit Type')}
              >
                <MenuItem value=''>{t('All')}</MenuItem>
                <MenuItem value='visitor'>{t('Visitor')}</MenuItem>
                <MenuItem value='employee'>{t('Employee')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('Added By')}</InputLabel>
              <Select
                value={localFilters.addedBy || ''}
                onChange={e => handleFilterChange('addedBy', e.target.value)}
                label={t('Added By')}
              >
                <MenuItem value=''>{t('Search in Users')}</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.nameEn || user.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('Purpose of Permit')}
              value={localFilters.purpose || ''}
              onChange={e => handleFilterChange('purpose', e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('Permit Type')}</InputLabel>
              <Select
                value={localFilters.type || ''}
                onChange={e => handleFilterChange('type', e.target.value)}
                label={t('Permit Type')}
              >
                <MenuItem value=''>{t('All')}</MenuItem>
                <MenuItem value='entry_exit'>{t('Entry and Exit')}</MenuItem>
                <MenuItem value='entry'>{t('Entry')}</MenuItem>
                <MenuItem value='exit'>{t('Exit')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('Work Permit Number')}
              value={localFilters.workPermitNumber || ''}
              onChange={e => handleFilterChange('workPermitNumber', e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('Responsible Person')}</InputLabel>
              <Select
                value={localFilters.responsiblePerson || ''}
                onChange={e => handleFilterChange('responsiblePerson', e.target.value)}
                label={t('Responsible Person')}
              >
                <MenuItem value=''>{t('Search in Users')}</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.nameEn || user.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Fields - Full Width */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('Addition Date From')}
                  value={localFilters.additionDateFrom || ''}
                  onChange={e => handleFilterChange('additionDateFrom', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('Addition Date To')}
                  value={localFilters.additionDateTo || ''}
                  onChange={e => handleFilterChange('additionDateTo', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('Permit Duration From')}
                  value={localFilters.permitDurationFrom || ''}
                  onChange={e => handleFilterChange('permitDurationFrom', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='date'
                  label={t('Permit Duration To')}
                  value={localFilters.permitDurationTo || ''}
                  onChange={e => handleFilterChange('permitDurationTo', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleReset} color='secondary'>
          {t('Reset')}
        </Button>
        <Button onClick={handleClose}>{t('Cancel')}</Button>
        <Button variant='contained' onClick={handleApply}>
          {t('Filter Results')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermitFilterDialog
