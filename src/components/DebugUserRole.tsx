import { useAuthStore } from 'src/store'
import { Box, Typography, Paper } from '@mui/material'

const DebugUserRole = () => {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <Paper sx={{ p: 2, m: 2, bgcolor: 'error.light' }}>
        <Typography variant="h6">No User Found</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'info.light' }}>
      <Typography variant="h6">User Debug Info</Typography>
      <Typography variant="body2">
        <strong>User ID:</strong> {user._id}
      </Typography>
      <Typography variant="body2">
        <strong>Name:</strong> {user.nameEn} / {user.nameAr}
      </Typography>
      <Typography variant="body2">
        <strong>Email:</strong> {user.email}
      </Typography>
      <Typography variant="body2">
        <strong>Role ID:</strong> {user.role?._id || 'No Role'}
      </Typography>
      <Typography variant="body2">
        <strong>Role Name:</strong> {user.role?.nameEn} / {user.role?.nameAr}
      </Typography>
      <Typography variant="body2">
        <strong>User Has Full Permission:</strong> {user.has_full_permission ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body2">
        <strong>Role Has Full Permission:</strong> {user.role?.has_full_permission ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body2">
        <strong>Permissions Array:</strong> {JSON.stringify(user.permissions || [], null, 2)}
      </Typography>
    </Paper>
  )
}

export default DebugUserRole 