import { apiClient } from '.'

export default {
  get: async (url: string, header?: any, data?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.get(url, data)
  },

  post: async (url: string, data: any = {}, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.post(url, data)
  },

  postFormData: async (url: string, formData: FormData, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.post(url, formData)
  },

  patch: async (url: string, data: any, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.patch(url, data)
  },
  put: async (url: string, data: any, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.put(url, data)
  },

  putFormData: async (url: string, formData: FormData, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    return await apiClient.put(url, formData)
  },

  delete: async (url: string, data?: any, header?: any) => {
    if (header) {
      apiClient.setHeaders(header)
    }

    // For DELETE requests with body data, apisauce doesn't work properly
    // Use native fetch instead to ensure body data is sent correctly
    if (data) {
      try {
        // Get authentication token and project ID
        let token = localStorage.getItem('pfc-auth')
        if (token) {
          token = JSON.parse(token).state.token
        }

        let selectedProjectId = null
        try {
          const selectedProjectData = localStorage.getItem('pfc-selected-project')
          if (selectedProjectData) {
            const parsed = JSON.parse(selectedProjectData)
            selectedProjectId = parsed.state?.selectedProject?._id
          }
        } catch (error) {
          console.warn('Error getting selected project ID:', error)
        }

        // Prepare headers
        const headers: any = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }

        // Add authorization header
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        // Add project ID header
        if (selectedProjectId) {
          headers['x-project-id'] = selectedProjectId
        }

        // Add custom headers if provided
        if (header) {
          Object.assign(headers, header)
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api'
        const response = await fetch(`${baseUrl}/${url}`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify(data)
        })

        // Convert fetch response to match apisauce response format
        const responseData = await response.json()

        return {
          ok: response.ok,
          status: response.status,
          data: responseData,
          headers: response.headers
        }
      } catch (error) {
        console.error('Fetch error:', error)
        return {
          ok: false,
          status: 0,
          data: { message: 'Network error' },
          headers: {}
        }
      }
    }

    return await apiClient.delete(url)
  }
}
