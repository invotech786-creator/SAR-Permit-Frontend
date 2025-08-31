import { create } from 'apisauce'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api'

const apiClient = create({
  baseURL: baseUrl
})

const getSelectedProjectId = (): string | null => {
  try {
    const selectedProjectData = localStorage.getItem('pfc-selected-project')
    if (selectedProjectData) {
      const parsed = JSON.parse(selectedProjectData)
      const projectId = parsed.state?.selectedProject?._id
      if (projectId) {
        return projectId
      }
    }
  } catch (error) {
    console.warn('Error getting selected project ID:', error)
  }
  return null
}

apiClient.addAsyncRequestTransform(async (request: any) => {
  const { hasApiPermission, PermissionDeniedError, API_PERMISSIONS } = await import('../utils/permissions')
  const method = request.method?.toUpperCase()
  const url = request.url

  if (method && url) {
    const hasPermission = hasApiPermission(method, url)
    if (!hasPermission) {
      // console.error(`🚫 API Request BLOCKED - No permission for ${method} ${url}`)
      // throw new PermissionDeniedError(method, url, 'Permission denied')
    }
  }

  let token = localStorage.getItem('pfc-auth')

  if (token) {
    try {
      const parsed = JSON.parse(token)
      token = parsed.state?.token
    } catch (error) {
      console.error('❌ API Request - Error parsing auth data:', error)
      token = null
    }
  }

  const checkToken = request.headers.Authorization ? request.headers.Authorization?.split(' ')[1] : null

  if (!checkToken && token) {
    request.headers.Authorization = `Bearer ${token}`
  }

  if (!request.headers['x-project-id']) {
    const selectedProjectId = getSelectedProjectId()
    if (selectedProjectId) {
      request.headers['x-project-id'] = selectedProjectId
    }
  }

  if (request.data instanceof FormData) {
    delete request.headers['Content-Type']
  }
})

apiClient.addResponseTransform(response => {
  if (response.status === 401) {
    localStorage.removeItem('pfc-auth')
    localStorage.removeItem('pfc-selected-project')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  if (response.status === 403) {
    console.error('❌ 403 Forbidden response received for URL:', response.config?.url)
    console.error('❌ Response data:', response.data)
    console.error('❌ User does not have permission for this action')

    // Don't auto-redirect to unauthorized page, just log
  }
})

export const config = async () => {
  let token = localStorage.getItem('pfc-auth')
  if (token) {
    token = JSON.parse(token).state.token
  }

  const selectedProjectId = getSelectedProjectId()

  const headers: any = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  }

  if (selectedProjectId) {
    headers['x-project-id'] = selectedProjectId
  }

  return { headers }
}

export const authConfig = async (token: string) => {
  const selectedProjectId = getSelectedProjectId()

  const headers: any = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  }

  if (selectedProjectId) {
    headers['x-project-id'] = selectedProjectId
  }

  return { headers }
}

export default apiClient
