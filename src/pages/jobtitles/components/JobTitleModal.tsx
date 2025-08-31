import { FC, useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  FormControl,
  Grid,
  DialogActions,
  Backdrop,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FallbackSpinner from 'src/@core/components/spinner'
import * as yup from 'yup'
import { useFormik } from 'formik'

import { ErrorMessage } from 'src/components'
import { useJobTitleStore } from 'src/store'
import {
  arabicCharacterRequiredMessage,
  arabicNameOrNumberPattern,
  englishCharacterRequiredMessage,
  englishNameOrNumberPattern,
  fieldRequiredMessage
} from 'src/utils'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  toggle: () => void
  jobTitle?: any
  mode: 'Add' | 'Edit' | 'View'
  onSuccess?: () => void
}

interface FormValues {
  nameAr: string
  nameEn: string
}

const JobTitleModal: FC<Props> = ({ open, toggle, jobTitle, mode, onSuccess }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { createJobTitle, updateJobTitle } = useJobTitleStore()
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const validationSchema = yup.object().shape({
    nameAr: yup
      .string()
      .required(t('Field is required'))
      .matches(arabicNameOrNumberPattern, arabicCharacterRequiredMessage),
    nameEn: yup
      .string()
      .required(t('Field is required'))
      .matches(englishNameOrNumberPattern, englishCharacterRequiredMessage)
  })

  const initialValues: FormValues = {
    nameAr: jobTitle?.nameAr || '',
    nameEn: jobTitle?.nameEn || ''
  }

  // Check if form has changes compared to original job title data
  const checkForChanges = useCallback(
    (values: FormValues) => {
      if (mode === 'Add') return true

      const originalData = {
        nameAr: jobTitle?.nameAr || '',
        nameEn: jobTitle?.nameEn || ''
      }

      return Object.keys(originalData).some(
        key => values[key as keyof FormValues] !== originalData[key as keyof typeof originalData]
      )
    },
    [mode, jobTitle]
  )

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      if (mode === 'Add') {
        await createJobTitle(values)
      } else if (mode === 'Edit' && jobTitle?._id) {
        await updateJobTitle(jobTitle._id, values)
      }
      toggle()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting job title form:', error)
    } finally {
      setLoading(false)
    }
  }

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true
  })

  // Update hasChanges whenever form values change
  useEffect(() => {
    const changes = checkForChanges(values)
    setHasChanges(changes)
  }, [values, mode, jobTitle, checkForChanges])

  return (
    <Dialog fullWidth maxWidth='sm' open={open} onClose={toggle} dir={isRTL ? 'rtl' : 'ltr'}>
      <form onSubmit={e => e.preventDefault()}>
        <DialogTitle
          id='user-view-edit'
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          {t(mode)} {t('Job Title')}
          <IconButton
            onClick={toggle}
            sx={{
              position: 'absolute',
              right: theme => (isRTL ? 'auto' : theme.spacing(2)),
              left: theme => (isRTL ? theme.spacing(2) : 'auto'),
              top: theme => theme.spacing(2),
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  label={t('Name (Arabic)')}
                  name='nameAr'
                  value={values.nameAr}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={mode === 'View'}
                  multiline
                  minRows={1}
                  maxRows={3}
                  sx={{ direction: isRTL ? 'ltr' : 'rtl' }}
                />
                <ErrorMessage error={errors.nameAr} touched={touched.nameAr} />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  label={t('Name (English)')}
                  name='nameEn'
                  value={values.nameEn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={mode === 'View'}
                  sx={{ direction: isRTL ? 'rtl' : 'ltr' }}
                />
                <ErrorMessage error={errors.nameEn} touched={touched.nameEn} />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          {mode !== 'View' && (
            <Button
              onClick={() => handleSubmit()}
              variant='contained'
              disabled={loading || (mode === 'Edit' && !hasChanges)}
            >
              {t('Save')}
            </Button>
          )}
          <Button onClick={toggle} variant='outlined' color='secondary' type='button' disabled={loading}>
            {t('Cancel')}
          </Button>
        </DialogActions>
      </form>

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

export default JobTitleModal
