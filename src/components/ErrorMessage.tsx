import { FC } from 'react'
import { styled } from '@mui/material/styles'

const Error = styled('div')(() => ({
  color: 'red',
  fontSize: '14px',
  marginTop: '4px',
  fontStyle: 'italic'
}))

interface Props {
  error: any
  touched: boolean | undefined
}

const ErrorMessage: FC<Props> = ({ error, touched }) => {
  if (!touched) return null

  return <Error>{error}</Error>
}

export default ErrorMessage
