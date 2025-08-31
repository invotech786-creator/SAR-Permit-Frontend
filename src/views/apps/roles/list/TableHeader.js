import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from '../../../../@core/components/icon'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const TableHeader = props => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { onShowAllColumns, selectedRows, onBulkAction, handleFilter, value, loading, canDelete, canToggleStatus } = props

  // ** State for controlled select
  const [bulkActionValue, setBulkActionValue] = useState('')

  // ** Handle bulk action with value reset
  const handleBulkActionChange = actionValue => {
    if (actionValue && onBulkAction) {
      onBulkAction(actionValue)
      // Reset the select value after action is triggered
      setBulkActionValue('')
    }
  }

  return (
    <Box
      sx={{
        py: 4,
        px: 6,
        rowGap: 2,
        columnGap: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* Bulk Actions Select */}
      {(canDelete || canToggleStatus) && (
        <Select
          size='small'
          value={bulkActionValue}
          displayEmpty
          sx={{ mr: isRTL ? 0 : 4, ml: isRTL ? 4 : 0, mb: 2 }}
          disabled={!selectedRows || selectedRows.length === 0 || loading}
          renderValue={selected => (selected === '' ? t('Actions') : selected)}
          onChange={e => handleBulkActionChange(e.target.value)}
        >
          <MenuItem disabled>{t('Actions')}</MenuItem>
          {canDelete && <MenuItem value='Delete'>{t('Delete')}</MenuItem>}
          {canToggleStatus && <MenuItem value='Active'>{t('Active')}</MenuItem>}
          {canToggleStatus && <MenuItem value='Inactive'>{t('Inactive')}</MenuItem>}
        </Select>
      )}

      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Field */}
        {handleFilter && (
          <TextField
            size='small'
            value={value || ''}
            sx={{ mr: 4 }}
            placeholder={t('Search Roles')}
            onChange={e => handleFilter(e.target.value)}
            InputProps={{
              endAdornment: value ? (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => handleFilter('')}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { 
                        color: 'text.primary',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Icon icon='tabler:x' fontSize='1rem' />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        )}

        {/* Show All Columns Button */}
        {onShowAllColumns && (
          <Button 
            onClick={onShowAllColumns} 
            variant='outlined' 
            sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }, ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0 }} 
            size='small'
          >
            <Icon fontSize='1rem' icon='tabler:columns' />
            {t('Show All Columns')}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default TableHeader
