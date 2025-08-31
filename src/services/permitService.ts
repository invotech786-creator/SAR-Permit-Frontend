import { api } from 'src/api-config'
import { IDepartment, IPermit, IPermitStatusCounts, IPermitFilters, IPermitResponse } from 'src/types'

// API response type
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const permitService = {
  // Get all departments
  getDepartments: async (): Promise<IDepartment[]> => {
    try {
      const response = await api.get<ApiResponse<IDepartment[]>>('/departments')
      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch departments')
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
  },

  // Get permits with filters and pagination
  getPermits: async (filters: IPermitFilters = {}): Promise<IPermitResponse> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      // Add filter parameters
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.workPermitType) queryParams.append('workPermitType', filters.workPermitType)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      if (filters.createdAtFrom) queryParams.append('createdAtFrom', filters.createdAtFrom)
      if (filters.createdAtTo) queryParams.append('createdAtTo', filters.createdAtTo)
      if (filters.number) queryParams.append('number', filters.number)
      if (filters.purpose) queryParams.append('purpose', filters.purpose)
      if (filters.createdBy) queryParams.append('createdBy', filters.createdBy)
      if (filters.responsibleId) queryParams.append('responsibleId', filters.responsibleId)

      // Add pagination parameters
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())

      const url = `/permits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await api.get<ApiResponse<IPermitResponse>>(url)

      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch permits')
    } catch (error) {
      console.error('Error fetching permits:', error)
      throw error
    }
  },

  // Get permit status counts
  getPermitStatusCounts: async (): Promise<IPermitStatusCounts> => {
    try {
      const response = await api.get<ApiResponse<IPermitStatusCounts>>('/permits/status-counts')
      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch permit status counts')
    } catch (error) {
      console.error('Error fetching permit status counts:', error)
      throw error
    }
  },

  // Get single permit by ID
  getPermitById: async (id: string): Promise<IPermit> => {
    try {
      const response = await api.get<ApiResponse<IPermit>>(`/permits/${id}`)
      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch permit')
    } catch (error) {
      console.error('Error fetching permit:', error)
      throw error
    }
  },

  // Create new permit
  createPermit: async (permitData: Partial<IPermit> | FormData): Promise<IPermit> => {
    try {
      const response = await api.post<ApiResponse<IPermit>>('/permits', permitData)
      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to create permit')
    } catch (error) {
      console.error('Error creating permit:', error)
      throw error
    }
  },

  // Update permit
  updatePermit: async (id: string, permitData: Partial<IPermit>): Promise<IPermit> => {
    try {
      const response = await api.put<ApiResponse<IPermit>>(`/permits/${id}`, permitData)
      if (response.ok && response.data?.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update permit')
    } catch (error) {
      console.error('Error updating permit:', error)
      throw error
    }
  },

  // Update permit status
  updatePermitStatus: async (id: string, statusData: URLSearchParams): Promise<boolean> => {
    try {
      const response = await api.patch<ApiResponse<boolean>>(`/permits/${id}/status`, statusData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (response.ok && response.data?.success) {
        return true
      }
      throw new Error(response.data?.message || 'Failed to update permit status')
    } catch (error) {
      console.error('Error updating permit status:', error)
      throw error
    }
  },

  // Decline person
  declinePerson: async (permitId: string, personId: string, declineReason: string): Promise<boolean> => {
    try {
      const formData = new URLSearchParams()
      formData.append('personId', personId)
      formData.append('declineReason', declineReason)

      const response = await api.patch<ApiResponse<boolean>>(`/permits/${permitId}/person-decline`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (response.ok && response.data?.success) {
        return true
      }
      throw new Error(response.data?.message || 'Failed to decline person')
    } catch (error) {
      console.error('Error declining person:', error)
      throw error
    }
  },

  // Delete permit
  deletePermit: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/permits/${id}`)
      if (response.ok && response.data?.success) {
        return true
      }
      throw new Error(response.data?.message || 'Failed to delete permit')
    } catch (error) {
      console.error('Error deleting permit:', error)
      throw error
    }
  }
}