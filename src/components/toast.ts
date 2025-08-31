import toast from 'react-hot-toast'

export const showSuccessMessage = (message: string) => {
  toast.success(message)
}

export const showErrorMessage = (message: string) => {
  toast.error(message)
}
