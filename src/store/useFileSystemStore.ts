import { create } from 'zustand'
import toast from 'react-hot-toast'
import { fileSystemService, FileSystemItem } from '../services/fileSystemService'

interface FileSystemStore {
  // State
  rootItems: FileSystemItem[]
  currentFolderItems: FileSystemItem[]
  currentFolder: FileSystemItem | null
  loading: boolean
  uploadProgress: number

  // Actions
  fetchRootItems: () => Promise<void>
  fetchFolderContents: (folderId: string) => Promise<void>
  createFolder: (name: string, nameAr?: string, nameEn?: string, parentId?: string) => Promise<void>
  uploadFile: (formData: FormData, parentId: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  renameItem: (id: string, newName: string, newNameAr?: string, newNameEn?: string) => Promise<void>
  updateItem: (
    id: string,
    updateData: {
      name: string
      nameAr?: string
      nameEn?: string
      documentNumber?: string
      notes?: string
    }
  ) => Promise<void>
  downloadFile: (id: string) => Promise<void>
  resetUploadProgress: () => void
  clearCurrentFolder: () => void
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  // Initial state
  rootItems: [],
  currentFolderItems: [],
  currentFolder: null,
  loading: false,
  uploadProgress: 0,
  // Fetch complete folder tree
  fetchRootItems: async () => {
    try {
      set({ loading: true })
      const response = await fileSystemService.getCompleteFolderTree()

      if (response.ok && response.data) {
        set({ rootItems: response.data.data || [], loading: false })
      } else {
        // Prioritize details field from API response, then error field, then fall back to other error messages
        const errorMessage =
          response.data?.details ||
          response.data?.error ||
          response.data?.message ||
          (response as any).problem ||
          'Failed to fetch folder tree'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch folder tree'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Fetch folder contents
  fetchFolderContents: async (folderId: string) => {
    try {
      set({ loading: true })
      const response = await fileSystemService.getFilesFromFolder(folderId)
      const folderResponse = await fileSystemService.getItemById(folderId)

      if (response.ok && folderResponse.ok) {
        set({
          currentFolderItems: response.data.data || [],
          currentFolder: folderResponse.data.data,
          loading: false
        })
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to fetch folder contents'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch folder contents'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Create folder
  createFolder: async (name: string, nameAr?: string, nameEn?: string, parentId?: string) => {
    try {
      set({ loading: true })

      const folderData = {
        name: name.trim(),
        nameAr: nameAr?.trim(),
        nameEn: nameEn?.trim(),
        parentId: parentId || null
      }

      const response = await fileSystemService.createFolder(folderData)

      if (response.ok && response.data) {
        toast.success('Folder created successfully')

        set({ loading: false })

        // Smart refresh: only refresh what's needed (after loading is false)
        setTimeout(() => {
          const currentState = get()
          if (currentState.currentFolder && parentId && currentState.currentFolder._id === parentId) {
            // If viewing the parent folder, just refresh current folder contents
            get().fetchFolderContents(parentId)
          } else {
            // If not viewing the folder, refresh the root tree
            get().fetchRootItems()
          }
        }, 100)
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to create folder'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create folder'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Upload file
  uploadFile: async (formData: FormData, parentId: string) => {
    try {
      set({ loading: true, uploadProgress: 0 })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        set(state => ({ uploadProgress: Math.min(state.uploadProgress + 10, 90) }))
      }, 200)

      const response = await fileSystemService.uploadFile(formData)

      clearInterval(progressInterval)
      set({ uploadProgress: 100 })

      if (response.ok && response.data) {
        toast.success('File uploaded successfully')

        setTimeout(() => {
          set({ loading: false, uploadProgress: 0 })

          // Smart refresh: only refresh what's needed (after loading is false)
          const currentState = get()
          if (currentState.currentFolder && currentState.currentFolder._id === parentId) {
            // If viewing the upload destination, just refresh current folder contents
            get().fetchFolderContents(parentId)
          } else {
            // If not viewing the folder, refresh the root tree
            get().fetchRootItems()
          }
        }, 500)
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to upload file'
        toast.error(errorMessage)
        set({ loading: false, uploadProgress: 0 })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file'
      toast.error(errorMessage)
      set({ loading: false, uploadProgress: 0 })
    }
  },

  // Delete item
  deleteItem: async (id: string) => {
    try {
      set({ loading: true })
      const response = await fileSystemService.deleteItem(id)

      if (response.ok && response.data) {
        toast.success('Item deleted successfully')

        set({ loading: false })

        // Smart refresh: only refresh what's needed (after loading is false)
        setTimeout(() => {
          const currentState = get()
          if (currentState.currentFolder && currentState.currentFolderItems.some(item => item._id === id)) {
            // If viewing the folder containing the deleted item, just refresh current folder contents
            get().fetchFolderContents(currentState.currentFolder._id)
          } else {
            // If not viewing the folder, refresh the root tree
            get().fetchRootItems()
          }
        }, 100)
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to delete item'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete item'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Rename item
  renameItem: async (id: string, newName: string, newNameAr?: string, newNameEn?: string) => {
    try {
      set({ loading: true })

      const updateData = {
        name: newName.trim(),
        nameAr: newNameAr?.trim(),
        nameEn: newNameEn?.trim()
      }

      const response = await fileSystemService.updateItem(id, updateData)

      if (response.ok && response.data) {
        toast.success('Item renamed successfully')

        set({ loading: false })

        // Smart refresh: only refresh what's needed (after loading is false)
        setTimeout(() => {
          const currentState = get()
          if (currentState.currentFolder && currentState.currentFolderItems.some(item => item._id === id)) {
            // If viewing the folder containing the renamed item, just refresh current folder contents
            get().fetchFolderContents(currentState.currentFolder._id)
          } else {
            // If not viewing the folder, refresh the root tree
            get().fetchRootItems()
          }
        }, 100)
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to rename item'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to rename item'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Update item (for updating additional fields like documentNumber, notes, etc.)
  updateItem: async (
    id: string,
    updateData: {
      name: string
      nameAr?: string
      nameEn?: string
      documentNumber?: string
      notes?: string
    }
  ) => {
    try {
      set({ loading: true })

      const response = await fileSystemService.updateItem(id, updateData)

      if (response.ok && response.data) {
        toast.success('Item updated successfully')

        set({ loading: false })

        // Smart refresh: only refresh what's needed (after loading is false)
        setTimeout(() => {
          const currentState = get()
          if (currentState.currentFolder && currentState.currentFolderItems.some(item => item._id === id)) {
            // If viewing the folder containing the updated item, just refresh current folder contents
            get().fetchFolderContents(currentState.currentFolder._id)
          } else {
            // If not viewing the folder, refresh the root tree
            get().fetchRootItems()
          }
        }, 100)
      } else {
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to update item'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update item'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Download file
  downloadFile: async (id: string) => {
    try {
      set({ loading: true })
      const response = await fileSystemService.downloadFile(id)

      if (response.ok && response.data) {
        toast.success('Download started')
        // Create download link
        const link = document.createElement('a')
        link.href = response.data.data.downloadUrl
        link.download = response.data.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        set({ loading: false })
      } else {
        console.error('Store: downloadFile error response:', response)
        const errorMessage = (response as any).data?.message || (response as any).problem || 'Failed to download file'
        toast.error(errorMessage)
        set({ loading: false })
      }
    } catch (error: any) {
      console.error('Store: downloadFile catch error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download file'
      toast.error(errorMessage)
      set({ loading: false })
    }
  },

  // Reset upload progress
  resetUploadProgress: () => set({ uploadProgress: 0 }),

  // Clear current folder to go back to tree view
  clearCurrentFolder: () => set({
    currentFolderItems: [],
    currentFolder: null
  })
}))
