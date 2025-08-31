// ** MUI Imports
import Box from '@mui/material/Box'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

const FooterContent = () => {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()}, ${t('Made by')} `}
        <MuiLink target='_blank' href='https://www.wulooj.com/en/home'>
          Wulooj
        </MuiLink>
      </Typography>
    </Box>
  )
}

export default FooterContent
