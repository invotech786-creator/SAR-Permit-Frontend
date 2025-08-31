// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

const FallbackSpinner = ({ sx }: { sx?: BoxProps['sx'] }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      <img
        src={
          theme.palette.mode === 'dark'
            ? '/images/auth/sar-logo-char-only-dark.svg'
            : '/images/auth/sar-logo-char-only.svg'
        }
        width={64}
        height={64}
        alt='SAR Logo'
      />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  )
}

export default FallbackSpinner
