import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  TextField,
  Grid
} from '@mui/material'
import { CloudUpload as UploadIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFileSystemStore } from '../store/useFileSystemStore'

interface FileUploadModalProps {
  open: boolean
  onClose: () => void
  parentId: string
  parentName: string
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ open, onClose, parentId, parentName }) => {
  const { t } = useTranslation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [documentNameEn, setDocumentNameEn] = useState('')
  const [documentNameAr, setDocumentNameAr] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, loading, uploadProgress } = useFileSystemStore()

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    // Close modal immediately when user clicks upload
    onClose()

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('parentId', parentId)

        // Add document metadata
        if (documentNameEn) formData.append('nameEn', documentNameEn)
        if (documentNameAr) formData.append('nameAr', documentNameAr)
        if (documentNumber) formData.append('documentNumber', documentNumber)
        if (notes) formData.append('notes', notes)

        await uploadFile(formData, parentId)
      }

      setSelectedFiles([])
      setDocumentNameEn('')
      setDocumentNameAr('')
      setDocumentNumber('')
      setNotes('')
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleCloseModal = () => {
    setSelectedFiles([])
    setDocumentNameEn('')
    setDocumentNameAr('')
    setDocumentNumber('')
    setNotes('')
    onClose()
  }

  // Input validation handlers to prevent wrong language characters
  const handleEnglishInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow English characters, spaces, and common punctuation
    const englishRegex = /^[a-zA-Z\s\-'()&.]*$/

    if (englishRegex.test(value) || value === '') {
      setDocumentNameEn(value)
    }
  }

  const handleArabicInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow Arabic characters and spaces
    const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]*$/

    if (arabicRegex.test(value) || value === '') {
      setDocumentNameAr(value)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t('Bytes')}`
    const k = 1024
    const sizes = [t('Bytes'), t('KB'), t('MB'), t('GB')]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📈'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥'
      case 'mp3':
      case 'wav':
        return '🎵'
      default:
        return '📁'
    }
  }

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{t('Upload Documents to "{{parentName}}"', { parentName })}</Typography>
          <IconButton onClick={handleCloseModal} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Document Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Document Name (English)')}
              value={documentNameEn}
              onChange={handleEnglishInput}
              placeholder={t('Enter document name in English...')}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Document Name (Arabic)')}
              value={documentNameAr}
              onChange={handleArabicInput}
              placeholder={t('Enter document name in Arabic...')}
              dir='rtl'
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Document Number and Notes */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Document Number')}
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              placeholder={t('Enter document number for ordering...')}
              helperText={t('Used for ordering documents')}
              multiline
              rows={2}
              sx={{
                '& .MuiInputBase-root': {
                  height: 'auto'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('Notes')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('Enter any additional notes...')}
              multiline
              rows={2}
              sx={{
                '& .MuiInputBase-root': {
                  height: 'auto'
                }
              }}
            />
          </Grid>

          {/* File Upload Area */}
          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: isDragOver ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease',
                mb: 2
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type='file'
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files)}
              />

              <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant='h6' gutterBottom>
                {t('Drop files here or click to select')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('You can select multiple files')}
              </Typography>
            </Box>
          </Grid>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                {t('Selected Files ({{count}})', { count: selectedFiles.length })}
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <Box display='flex' alignItems='center'>
                      <Typography sx={{ mr: 1 }}>{getFileIcon(file)}</Typography>
                      <Box>
                        <Typography variant='body2' noWrap sx={{ maxWidth: 200 }}>
                          {file.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size='small' onClick={() => removeFile(index)} color='error'>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <Grid item xs={12}>
              <Typography variant='body2' gutterBottom>
                {t('Uploading... {{progress}}%', { progress: uploadProgress })}
              </Typography>
              <LinearProgress variant='determinate' value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal} disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          variant='contained'
          disabled={selectedFiles.length === 0 || loading}
          startIcon={<UploadIcon />}
        >
          {loading
            ? t('Uploading...')
            : t('Upload {{count}} File', { count: selectedFiles.length, postProcess: 'pluralization' })
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FileUploadModal
