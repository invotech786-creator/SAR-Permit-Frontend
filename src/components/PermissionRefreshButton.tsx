import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react'
import { usePermissionRefresh } from 'src/hooks/usePermissionRefresh'

interface PermissionRefreshButtonProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'default' | 'primary' | 'secondary'
  tooltip?: string
}

const PermissionRefreshButton: React.FC<PermissionRefreshButtonProps> = ({
  size = 'medium',
  color = 'default',
  tooltip = 'Refresh permissions'
}) => {
  const { refresh, refreshing } = usePermissionRefresh()

  const handleRefresh = async () => {
    await refresh()
  }

  return (
    <Tooltip title={tooltip}>
      <IconButton 
        size={size} 
        color={color} 
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <Icon 
          icon={refreshing ? 'mdi:loading' : 'mdi:refresh'} 
          className={refreshing ? 'animate-spin' : ''}
        />
      </IconButton>
    </Tooltip>
  )
}

export default PermissionRefreshButton