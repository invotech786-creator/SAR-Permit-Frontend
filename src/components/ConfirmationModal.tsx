// ** React Imports
import { FC } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  toggle: () => void
  mode: string
  description: string
  onClick: () => void
  btnName: string
}

const ConfirmationModal: FC<Props> = ({ open, toggle, mode, description, onClick, btnName }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  
  return (
    <Dialog fullWidth maxWidth='sm' scroll='body' onClose={toggle} open={open} dir={isRTL ? 'rtl' : 'ltr'}>
      <DialogTitle
        sx={{
          textAlign: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          position: 'relative'
        }}
      >
        <Typography variant='h5' component='span'>
          {mode}
        </Typography>
        <IconButton
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: isRTL ? 'auto' : 8,
            left: isRTL ? 8 : 'auto',
            top: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(5)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
        }}
      >
        <Typography sx={{ textAlign: 'center' }} variant='h6'>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Box className='demo-space-x'>
          <Button onClick={onClick} type='submit' variant='contained'>
            {btnName}
          </Button>
          <Button color='secondary' variant='outlined' onClick={toggle}>
            {t('Cancel')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationModal
