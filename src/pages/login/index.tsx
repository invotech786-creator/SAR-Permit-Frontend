'use client'

import { useState, ReactNode, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { styled } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import themeConfig from 'src/configs/themeConfig'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuthStore } from 'src/store'
import { useRouter } from 'next/router'
import { getFirstAccessiblePage } from 'src/utils/navigation-helper'

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(6),
  [theme.breakpoints.up('md')]: {
    maxWidth: 480
  }
}))

const LeftSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  flex: 1,
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingBottom: theme.spacing(6)
}))

const LoginBgImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  zIndex: 1
})

const LoginFooter = styled(Box)(({ theme }) => ({
  position: 'absolute',
  zIndex: 2,
  display: 'flex',
  gap: theme.spacing(4),
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.common.white,
  width: '100%',
  height: 86,
  marginTop: 100,
  bottom: 0
}))

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().min(5).required('Password is required')
})

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordFilled, setIsPasswordFilled] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { login } = useAuthStore()

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async values => {
      const { username, password } = values
      const result = await login({ username, password })
      if (result) {
        // Redirect to first accessible page based on user permissions
        const firstAccessiblePage = getFirstAccessiblePage()
        console.log(`🔄 Login successful - redirecting to first accessible page: ${firstAccessiblePage}`)
        await router.push(firstAccessiblePage)
      }
    }
  })

  // Force label to shrink when component mounts (for auto-fill scenarios)
  useEffect(() => {
    // Since this is a login page, if the user has saved credentials,
    // the password field will likely be auto-filled
    // Force the label to shrink after a short delay
    const timer = setTimeout(() => {
      setIsPasswordFilled(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Use MutationObserver to detect auto-fill changes
  useEffect(() => {
    if (passwordInputRef.current) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // Check if the field has content after style changes
            if (passwordInputRef.current && passwordInputRef.current.value) {
              setIsPasswordFilled(true)
            }
          }
        })
      })

      observer.observe(passwordInputRef.current, {
        attributes: true,
        attributeFilter: ['style']
      })

      return () => observer.disconnect()
    }
  }, [])

  // Monitor formik password value changes
  useEffect(() => {
    setIsPasswordFilled(formik.values.password.length > 0)
  }, [formik.values.password])

  return (
    <Box className='login-page' display='flex' minHeight='100vh'>
      {!hidden && (
        <LeftSection>
          <LoginBgImage src='/images/auth/login-bg.webp' alt='Login Background' />
          <LoginFooter>
            <Link href='/login'>
              <img src='/images/auth/sar-logo.svg' width={110} height={200} alt='SAR Logo' />
            </Link>
          </LoginFooter>
        </LeftSection>
      )}

      <RightWrapper>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ my: 6 }}>
            <Typography sx={{ mb: 1.5, fontWeight: 500, fontSize: '1.625rem', lineHeight: 1.385 }}>
              {`Welcome to ${themeConfig.templateName}! 👋🏻`}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Please sign-in to your account and start the adventure
            </Typography>
          </Box>

          <form noValidate onSubmit={formik.handleSubmit}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <TextField
                autoFocus
                fullWidth
                label='Username'
                name='username'
                value={formik.values.username}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                placeholder='Enter your username'
              />
              {formik.touched.username && formik.errors.username && (
                <FormHelperText sx={{ color: 'error.main' }}>{formik.errors.username}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 1.5 }}>
              <TextField
                ref={passwordInputRef}
                fullWidth
                label='Password'
                name='password'
                placeholder='Enter your password'
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={() => {
                  // Check if field has content when focused
                  if (passwordInputRef.current && passwordInputRef.current.value) {
                    setIsPasswordFilled(true)
                  }
                }}
                type={showPassword ? 'text' : 'password'}
                error={formik.touched.password && Boolean(formik.errors.password)}
                InputLabelProps={{
                  shrink: isPasswordFilled || formik.values.password.length > 0
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label='toggle password visibility'
                      >
                        <Icon icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} fontSize={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <FormHelperText sx={{ color: 'error.main' }}>{formik.errors.password}</FormHelperText>
              )}
            </FormControl>

            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 }}>
              Login
            </Button>
          </form>
        </Box>
      </RightWrapper>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
