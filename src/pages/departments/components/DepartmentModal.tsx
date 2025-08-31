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
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FallbackSpinner from 'src/@core/components/spinner'
import * as yup from 'yup'
import { useFormik } from 'formik'

import { ErrorMessage } from 'src/components'
import { useDepartmentStore } from 'src/store'
import { IDepartment } from 'src/types'
import {
  arabicNameOrNumberPattern,
  englishNameOrNumberPattern
} from 'src/utils'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  toggle: () => void
  department?: IDepartment
  mode: 'Add' | 'Edit' | 'View'
}

const DepartmentModal: FC<Props> = ({ open, toggle, department, mode }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { createDepartment, updateDepartment } = useDepartmentStore()
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const validationSchema = yup.object().shape({
    nameAr: yup
      .string()
      .test('one-required', t('At least one name (Arabic or English) is required'), function (value) {
        const { nameEn } = this.parent
        return !!(value || nameEn)
      })
      .matches(arabicNameOrNumberPattern, t('Can contain only Arabic letters, numbers, or symbols')),
    nameEn: yup
      .string()
      .test('one-required', t('At least one name (Arabic or English) is required'), function (value) {
        const { nameAr } = this.parent
        return !!(value || nameAr)
      })
      .matches(englishNameOrNumberPattern, t('Can contain only English letters, numbers, or symbols'))
  })

  const initialValues = {
    nameAr: department?.nameAr || '',
    nameEn: department?.nameEn || '',
    isActive: department?.isActive !== undefined ? department.isActive : true
  }

  // Check if form has changes compared to original department data
  const checkForChanges = useCallback(
    (values: typeof initialValues) => {
      if (mode === 'Add') return true

      const originalData = {
        nameAr: department?.nameAr || '',
        nameEn: department?.nameEn || '',
        isActive: department?.isActive !== undefined ? department.isActive : true
      }

      return Object.keys(originalData).some(
        key => values[key as keyof typeof values] !== originalData[key as keyof typeof originalData]
      )
    },
    [mode, department]
  )

  const onSubmit = async (values: typeof initialValues) => {
    setLoading(true)
    try {
      let result = false
      if (mode === 'Add') {
        result = await createDepartment(values)
      } else {
        result = await updateDepartment(department?._id || '', values)
      }

      if (result) {
        toggle()
      }
    } catch (error) {
      console.error('Error submitting department form:', error)
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
  }, [values, mode, department, checkForChanges])

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={toggle} sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <form onSubmit={e => e.preventDefault()}>
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          {t(mode)} {t('Department')}
          <IconButton
            onClick={toggle}
            sx={{
              position: 'absolute',
              right: isRTL ? 'auto' : theme => theme.spacing(2),
              left: isRTL ? theme => theme.spacing(2) : 'auto',
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
            {[
              { label: t('Name (Arabic)'), name: 'nameAr' },
              { label: t('Name (English)'), name: 'nameEn' }
            ].map(field => (
              <Grid item sm={12} md={6} key={field.name}>
                <FormControl fullWidth>
                  <TextField
                    label={field.label}
                    name={field.name}
                    value={(values as any)[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={mode === 'View'}
                    multiline={field.name === 'nameAr'}
                    minRows={1}
                    maxRows={field.name === 'nameAr' ? 3 : 1}
                    sx={{
                      '& .MuiInputBase-root': {
                        ...(field.name === 'nameAr'
                          ? {
                              height: '56px',
                              minHeight: '56px',
                              maxHeight: 'none',
                              alignItems: 'center',
                              '&.MuiInputBase-multiline': {
                                height: 'auto',
                                minHeight: '56px',
                                alignItems: 'flex-start',
                                paddingTop: '16.5px',
                                paddingBottom: '16.5px'
                              }
                            }
                          : {})
                      },
                      '& .MuiInputBase-input': {
                        ...(field.name === 'nameAr'
                          ? {
                              fontFamily: 'Arial, Tahoma, sans-serif',
                              direction: 'rtl',
                              textAlign: 'right',
                              lineHeight: '1.4375em',
                              padding: '0px 14px',
                              overflow: 'hidden',
                              resize: 'none'
                            }
                          : {})
                      },
                      '& .MuiInputLabel-root': {
                        ...(field.name === 'nameAr'
                          ? {
                              fontFamily: 'Arial, Tahoma, sans-serif',
                              direction: 'rtl',
                              textAlign: 'right'
                            }
                          : {})
                      }
                    }}
                  />
                  <ErrorMessage error={(errors as any)[field.name]} touched={(touched as any)[field.name]} />
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12}>
              <FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={(e) => handleChange({ target: { name: 'isActive', value: e.target.checked } })}
                      disabled={mode === 'View'}
                    />
                  }
                  label={t('Status')}
                  labelPlacement='start'
                  sx={{
                    marginLeft: 0,
                    '& .MuiFormControlLabel-label': {
                      marginRight: 2
                    }
                  }}
                />
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

export default DepartmentModal