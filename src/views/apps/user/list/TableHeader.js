// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { useState } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'

const TableHeader = props => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  // ** Props
  const { handleFilter, toggle, value, selectedRows, onBulkAction, onShowAllColumns, canCreate, canDelete, canUpdate } = props

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
      {(canDelete || canUpdate) && (
        <Select
          size='small'
          value={bulkActionValue}
          displayEmpty
          sx={{ mr: isRTL ? 0 : 4, ml: isRTL ? 4 : 0, mb: 2 }}
          disabled={selectedRows && selectedRows.length === 0}
          renderValue={selected => (selected === '' ? t('Actions') : selected)}
          onChange={e => handleBulkActionChange(e.target.value)}
        >
          <MenuItem disabled>{t('Actions')}</MenuItem>
          {canDelete && <MenuItem value='Delete'>{t('Delete')}</MenuItem>}
          {canUpdate && <MenuItem value='Active'>{t('Active')}</MenuItem>}
          {canUpdate && <MenuItem value='Inactive'>{t('Inactive')}</MenuItem>}
        </Select>
      )}
      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4 }}
          placeholder={t('Search User')}
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

        {canCreate && (
          <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }, ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0 }}>
            <Icon fontSize='1.125rem' icon='tabler:plus' />
            {t('Add New User')}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default TableHeader
