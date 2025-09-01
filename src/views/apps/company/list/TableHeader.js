// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Icon from '../../../../@core/components/icon'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const TableHeader = props => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  // ** Props
  const { selectedRows, toggle, onBulkAction, onShowAllColumns, canCreate, canDelete, canUpdate } = props

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
        p: 5,
        pb: 3,
        width: '100%',
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
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
          <Button
            onClick={toggle}
            variant='contained'
            sx={{ '& svg': { mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }, ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0 }}
          >
            {isRTL ? (
              <>
                {t('Add Company')}
                <Icon fontSize='1.125rem' icon='tabler:plus' />
              </>
            ) : (
              <>
                <Icon fontSize='1.125rem' icon='tabler:plus' />
                {t('Add Company')}
              </>
            )}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default TableHeader
