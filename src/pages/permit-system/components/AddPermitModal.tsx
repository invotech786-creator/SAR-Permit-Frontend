import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  OutlinedInput
} from '@mui/material'

import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import { permitService } from 'src/services/permitService'
import useUserStore from 'src/store/useUserStore'
import useCompanyStore from 'src/store/useCompanyStore'
import useLocationStore from 'src/store/useLocationStore'
import { showErrorMessage, showSuccessMessage } from 'src/components'
import { IDepartment, ICompany, IUser, ILocation, IPerson, IEquipment, IVehicle } from 'src/types'

interface AddPermitModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PersonFormData {
  nameAr: string
  nameEn: string
  nationality: string
  nationalId: string
}

interface EquipmentFormData {
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  count: number
}

interface VehicleFormData {
  type: string
  plateNumber: string
  color: string
}

const AddPermitModal: React.FC<AddPermitModalProps> = ({ open, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const currentLang = i18n.language

  // Store hooks
  const { getUsers, users } = useUserStore()
  const { getCompanies, companies } = useCompanyStore()
  const { getLocations, locations } = useLocationStore()

  // State for form data
  const [formData, setFormData] = useState({
    companyId: '',
    purposeAr: '',
    purposeEn: '',
    type: '',
    workPermitType: '',
    startingDepartmentId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    responsibleId: '',
    locations: [] as string[]
  })

  // State for extensible arrays
  const [people, setPeople] = useState<PersonFormData[]>([{ nameAr: '', nameEn: '', nationality: '', nationalId: '' }])
  const [equipments, setEquipments] = useState<EquipmentFormData[]>([
    { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', count: 1 }
  ])
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([{ type: '', plateNumber: '', color: '' }])

  // State for file uploads
  const [peopleImages, setPeopleImages] = useState<File[]>([])
  const [equipmentImages, setEquipmentImages] = useState<File[]>([])
  const [vehicleImages, setVehicleImages] = useState<File[]>([])

  // State for dropdowns
  const [departments, setDepartments] = useState<IDepartment[]>([])
  const [loading, setLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        getUsers({ limit: 1000 }),
        getCompanies({ limit: 1000 }),
        getLocations({ limit: 1000 }),
        loadDepartments()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const deps = await permitService.getDepartments()
      // Filter only active departments
      const activeDepartments = deps.filter(dept => dept.isActive)
      setDepartments(activeDepartments)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle people array changes
  const handlePeopleChange = (index: number, field: string, value: string) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], [field]: value }
    setPeople(newPeople)
  }

  // Handle equipment array changes
  const handleEquipmentChange = (index: number, field: string, value: string | number) => {
    const newEquipments = [...equipments]
    newEquipments[index] = { ...newEquipments[index], [field]: value }
    setEquipments(newEquipments)
  }

  // Handle vehicle array changes
  const handleVehicleChange = (index: number, field: string, value: string) => {
    const newVehicles = [...vehicles]
    newVehicles[index] = { ...newVehicles[index], [field]: value }
    setVehicles(newVehicles)
  }

  // Add new person
  const addPerson = () => {
    setPeople([...people, { nameAr: '', nameEn: '', nationality: '', nationalId: '' }])
  }

  // Remove person
  const removePerson = (index: number) => {
    if (people.length > 1) {
      const newPeople = people.filter((_, i) => i !== index)
      setPeople(newPeople)
      // Also remove corresponding image
      const newImages = peopleImages.filter((_, i) => i !== index)
      setPeopleImages(newImages)
    }
  }

  // Add new equipment
  const addEquipment = () => {
    setEquipments([...equipments, { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', count: 1 }])
  }

  // Remove equipment
  const removeEquipment = (index: number) => {
    if (equipments.length > 1) {
      const newEquipments = equipments.filter((_, i) => i !== index)
      setEquipments(newEquipments)
      // Also remove corresponding image
      const newImages = equipmentImages.filter((_, i) => i !== index)
      setEquipmentImages(newImages)
    }
  }

  // Add new vehicle
  const addVehicle = () => {
    setVehicles([...vehicles, { type: '', plateNumber: '', color: '' }])
  }

  // Remove vehicle
  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      const newVehicles = vehicles.filter((_, i) => i !== index)
      setVehicles(newVehicles)
      // Also remove corresponding image
      const newImages = vehicleImages.filter((_, i) => i !== index)
      setVehicleImages(newImages)
    }
  }

  // Handle file uploads
  const handleFileUpload = (files: FileList | null, type: 'people' | 'equipment' | 'vehicle', index: number) => {
    if (!files || files.length === 0) return

    const file = files[0]

    switch (type) {
      case 'people':
        const newPeopleImages = [...peopleImages]
        newPeopleImages[index] = file
        setPeopleImages(newPeopleImages)
        break
      case 'equipment':
        const newEquipmentImages = [...equipmentImages]
        newEquipmentImages[index] = file
        setEquipmentImages(newEquipmentImages)
        break
      case 'vehicle':
        const newVehicleImages = [...vehicleImages]
        newVehicleImages[index] = file
        setVehicleImages(newVehicleImages)
        break
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validate required fields
      if (
        !formData.companyId ||
        !formData.purposeAr ||
        !formData.purposeEn ||
        !formData.type ||
        !formData.workPermitType ||
        !formData.startingDepartmentId ||
        !formData.startDate ||
        !formData.endDate
      ) {
        showErrorMessage('Please fill in all required fields')
        return
      }

      // Validate date constraints
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day

      if (formData.startDate < today) {
        showErrorMessage('Start date cannot be in the past')
        return
      }

      if (formData.endDate <= formData.startDate) {
        showErrorMessage('End date must be after start date')
        return
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData()

      // Basic permit data
      formDataToSend.append('companyId', formData.companyId)
      formDataToSend.append('purposeAr', formData.purposeAr)
      formDataToSend.append('purposeEn', formData.purposeEn)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('workPermitType', formData.workPermitType)
      formDataToSend.append('startingDepartmentId', formData.startingDepartmentId)
      formDataToSend.append('startDate', formData.startDate!.toISOString().split('T')[0])
      formDataToSend.append('endDate', formData.endDate!.toISOString().split('T')[0])
      formDataToSend.append('responsibleId', formData.responsibleId)

      // Locations
      formData.locations.forEach(locationId => {
        formDataToSend.append('locations[]', locationId)
      })

      // People data
      people.forEach((person, index) => {
        if (person.nameAr && person.nationality && person.nationalId) {
          formDataToSend.append(`people[${index}][nameAr]`, person.nameAr)
          if (person.nameEn) formDataToSend.append(`people[${index}][nameEn]`, person.nameEn)
          formDataToSend.append(`people[${index}][nationality]`, person.nationality)
          formDataToSend.append(`people[${index}][nationalId]`, person.nationalId)

          // Add image if exists
          if (peopleImages[index]) {
            formDataToSend.append('peopleImages', peopleImages[index])
          }
        }
      })

      // Equipment data
      equipments.forEach((equipment, index) => {
        if (equipment.nameAr && equipment.nameEn) {
          formDataToSend.append(`equipments[${index}][nameAr]`, equipment.nameAr)
          formDataToSend.append(`equipments[${index}][nameEn]`, equipment.nameEn)
          formDataToSend.append(`equipments[${index}][descriptionAr]`, equipment.descriptionAr)
          formDataToSend.append(`equipments[${index}][descriptionEn]`, equipment.descriptionEn)
          formDataToSend.append(`equipments[${index}][count]`, equipment.count.toString())

          // Add image if exists
          if (equipmentImages[index]) {
            formDataToSend.append('equipmentImages', equipmentImages[index])
          }
        }
      })

      // Vehicle data
      vehicles.forEach((vehicle, index) => {
        if (vehicle.type && vehicle.plateNumber && vehicle.color) {
          formDataToSend.append(`vehicles[${index}][type]`, vehicle.type)
          formDataToSend.append(`vehicles[${index}][plateNumber]`, vehicle.plateNumber)
          formDataToSend.append(`vehicles[${index}][color]`, vehicle.color)

          // Add image if exists
          if (vehicleImages[index]) {
            formDataToSend.append('vehicleImages', vehicleImages[index])
          }
        }
      })

      // Call API
      await permitService.createPermit(formDataToSend)

      showSuccessMessage('Permit created successfully')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating permit:', error)
      showErrorMessage('Failed to create permit')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      companyId: '',
      purposeAr: '',
      purposeEn: '',
      type: '',
      workPermitType: '',
      startingDepartmentId: '',
      startDate: null,
      endDate: null,
      responsibleId: '',
      locations: []
    })
    setPeople([{ nameAr: '', nameEn: '', nationality: '', nationalId: '' }])
    setEquipments([{ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', count: 1 }])
    setVehicles([{ type: '', plateNumber: '', color: '' }])
    setPeopleImages([])
    setEquipmentImages([])
    setVehicleImages([])
  }

  // Get localized text helper
  const getLocalizedText = (enText: string, arText: string) => {
    return currentLang === 'ar' ? arText : enText
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1, position: 'relative' }}>
        <Typography variant='h5' component='span' sx={{ textAlign: 'center', display: 'block' }}>
          {currentLang === 'ar' ? 'إضافة تصريح جديد' : 'Add New Permit'}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500'
          }}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={currentLang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!formData.companyId}>
                      <InputLabel>{currentLang === 'ar' ? 'الشركة' : 'Company'}</InputLabel>
                      <Select
                        value={formData.companyId}
                        onChange={e => handleFormChange('companyId', e.target.value)}
                        label={currentLang === 'ar' ? 'الشركة' : 'Company'}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200
                            }
                          }
                        }}
                      >
                        {companies
                          .filter(company => company.isActive)
                          .map(company => (
                            <MenuItem key={company._id} value={company._id}>
                              {getLocalizedText(company.nameEn, company.nameAr)}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!formData.type}>
                      <InputLabel>{currentLang === 'ar' ? 'النوع' : 'Type'}</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={e => handleFormChange('type', e.target.value)}
                        label={currentLang === 'ar' ? 'النوع' : 'Type'}
                      >
                        <MenuItem value='entry and exit'>
                          {currentLang === 'ar' ? 'الدخول والخروج' : 'Entry and exit'}
                        </MenuItem>
                        <MenuItem value='entry'>{currentLang === 'ar' ? 'الدخول' : 'Entry'}</MenuItem>
                        <MenuItem value='exit'>{currentLang === 'ar' ? 'الخروج' : 'Exit'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!formData.workPermitType}>
                      <InputLabel>{currentLang === 'ar' ? 'نوع تصريح العمل' : 'Work Permit Type'}</InputLabel>
                      <Select
                        value={formData.workPermitType}
                        onChange={e => handleFormChange('workPermitType', e.target.value)}
                        label={currentLang === 'ar' ? 'نوع تصريح العمل' : 'Work Permit Type'}
                      >
                        <MenuItem value='visitor'>{currentLang === 'ar' ? 'زائر' : 'Visitor'}</MenuItem>
                        <MenuItem value='employee'>{currentLang === 'ar' ? 'موظف' : 'Employee'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={currentLang === 'ar' ? 'الهدف (عربي)' : 'Purpose (Arabic)'}
                      value={formData.purposeAr}
                      onChange={e => {
                        const value = e.target.value
                        // Only allow Arabic text, numbers, and common punctuation
                        const arabicRegex =
                          /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\.,!?;:'"()\-]*$/
                        if (arabicRegex.test(value) || value === '') {
                          handleFormChange('purposeAr', value)
                        }
                      }}
                      multiline
                      rows={2}
                      required
                      error={!formData.purposeAr}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={currentLang === 'ar' ? 'الهدف (إنجليزي)' : 'Purpose (English)'}
                      value={formData.purposeEn}
                      onChange={e => {
                        const value = e.target.value
                        // Only allow English text, numbers, and common punctuation
                        const englishRegex = /^[a-zA-Z\s\d\.,!?;:'"()\-]*$/
                        if (englishRegex.test(value) || value === '') {
                          handleFormChange('purposeEn', value)
                        }
                      }}
                      required
                      error={!formData.purposeEn}
                      helperText={
                        currentLang === 'ar' ? 'يجب أن يكون النص باللغة الإنجليزية فقط' : 'Text must be in English only'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!formData.startingDepartmentId}>
                      <InputLabel>{currentLang === 'ar' ? 'قسم البداية' : 'Starting Department'}</InputLabel>
                      <Select
                        value={formData.startingDepartmentId}
                        onChange={e => handleFormChange('startingDepartmentId', e.target.value)}
                        label={currentLang === 'ar' ? 'قسم البداية' : 'Starting Department'}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200
                            }
                          }
                        }}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {getLocalizedText(dept.nameEn, dept.nameAr)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{currentLang === 'ar' ? 'المسؤول / تعيين إلى' : 'Responsible Person'}</InputLabel>
                      <Select
                        value={formData.responsibleId}
                        onChange={e => handleFormChange('responsibleId', e.target.value)}
                        label={currentLang === 'ar' ? 'المسؤول / تعيين إلى' : 'Responsible Person'}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200
                            }
                          }
                        }}
                      >
                        {users
                          .filter(user => user.isActive)
                          .map(user => (
                            <MenuItem key={user._id} value={user._id}>
                              {getLocalizedText(user.nameEn, user.nameAr)}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type='date'
                      label={currentLang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                      value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const date = e.target.value ? new Date(e.target.value) : null
                        handleFormChange('startDate', date)
                        // Reset end date if it's before the new start date
                        if (formData.endDate && date && formData.endDate < date) {
                          handleFormChange('endDate', null)
                        }
                      }}
                      inputProps={{
                        min: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Start from next day
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                      required
                      error={!formData.startDate}
                      helperText={
                        currentLang === 'ar'
                          ? 'تاريخ البداية لا يمكن أن يكون في الماضي'
                          : 'Start date cannot be in the past'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type='date'
                      label={currentLang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                      value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const date = e.target.value ? new Date(e.target.value) : null
                        handleFormChange('endDate', date)
                      }}
                      inputProps={{
                        min: formData.startDate
                          ? formData.startDate.toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0] // Must be after start date
                      }}
                      InputLabelProps={{
                        shrink: true
                      }}
                      required
                      error={!formData.endDate}
                      disabled={!formData.startDate} // Disabled until start date is selected
                      helperText={
                        formData.startDate
                          ? currentLang === 'ar'
                            ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
                            : 'End date must be after start date'
                          : currentLang === 'ar'
                          ? 'يرجى اختيار تاريخ البداية أولاً'
                          : 'Please select start date first'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{currentLang === 'ar' ? 'المواقع' : 'Locations'}</InputLabel>
                      <Select
                        multiple
                        value={formData.locations}
                        onChange={e => handleFormChange('locations', e.target.value)}
                        input={<OutlinedInput label={currentLang === 'ar' ? 'المواقع' : 'Locations'} />}
                        renderValue={selected => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map(value => {
                              const location = locations.find(loc => loc._id === value)
                              return (
                                <Chip
                                  key={value}
                                  label={location ? getLocalizedText(location.nameEn, location.nameAr) : value}
                                  size='small'
                                />
                              )
                            })}
                          </Box>
                        )}
                      >
                        {locations.map(location => (
                          <MenuItem key={location._id} value={location._id}>
                            {getLocalizedText(location.nameEn, location.nameAr)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* People Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={currentLang === 'ar' ? 'الأشخاص' : 'People'}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Button startIcon={<Icon icon='tabler:plus' />} onClick={addPerson} variant='outlined' size='small'>
                    {currentLang === 'ar' ? 'إضافة شخص' : 'Add Person'}
                  </Button>
                }
              />
              <CardContent>
                {people.map((person, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                          value={person.nameAr}
                          onChange={e => handlePeopleChange(index, 'nameAr', e.target.value)}
                          required
                          error={!person.nameAr}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                          value={person.nameEn}
                          onChange={e => handlePeopleChange(index, 'nameEn', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الجنسية' : 'Nationality'}
                          value={person.nationality}
                          onChange={e => handlePeopleChange(index, 'nationality', e.target.value)}
                          required
                          error={!person.nationality}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الهوية الوطنية' : 'National ID'}
                          value={person.nationalId}
                          onChange={e => handlePeopleChange(index, 'nationalId', e.target.value)}
                          required
                          error={!person.nationalId}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <input
                          accept='image/*'
                          style={{ display: 'none' }}
                          id={`people-image-${index}`}
                          type='file'
                          onChange={e => handleFileUpload(e.target.files, 'people', index)}
                        />
                        <label htmlFor={`people-image-${index}`}>
                          <IconButton component='span' size='small'>
                            <Icon icon='tabler:photo' />
                          </IconButton>
                        </label>
                      </Grid>
                      <Grid item xs={12} md={1}>
                        {people.length > 1 && (
                          <IconButton onClick={() => removePerson(index)} color='error' size='small'>
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                    {peopleImages[index] && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={peopleImages[index].name}
                          onDelete={() => {
                            const newImages = [...peopleImages]
                            newImages[index] = undefined as any
                            setPeopleImages(newImages)
                          }}
                          size='small'
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Equipment Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={currentLang === 'ar' ? 'المعدات' : 'Equipment'}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Button
                    startIcon={<Icon icon='tabler:plus' />}
                    onClick={addEquipment}
                    variant='outlined'
                    size='small'
                  >
                    {currentLang === 'ar' ? 'إضافة معدات' : 'Add Equipment'}
                  </Button>
                }
              />
              <CardContent>
                {equipments.map((equipment, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                          value={equipment.nameAr}
                          onChange={e => handleEquipmentChange(index, 'nameAr', e.target.value)}
                          required
                          error={!equipment.nameAr}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                          value={equipment.nameEn}
                          onChange={e => handleEquipmentChange(index, 'nameEn', e.target.value)}
                          required
                          error={!equipment.nameEn}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                          value={equipment.descriptionAr}
                          onChange={e => handleEquipmentChange(index, 'descriptionAr', e.target.value)}
                          required
                          error={!equipment.descriptionAr}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                          value={equipment.descriptionEn}
                          onChange={e => handleEquipmentChange(index, 'descriptionEn', e.target.value)}
                          required
                          error={!equipment.descriptionEn}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <TextField
                          fullWidth
                          type='number'
                          label={currentLang === 'ar' ? 'العدد' : 'Count'}
                          value={equipment.count}
                          onChange={e => handleEquipmentChange(index, 'count', parseInt(e.target.value) || 1)}
                          required
                          error={!equipment.count || equipment.count < 1}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <input
                          accept='image/*'
                          style={{ display: 'none' }}
                          id={`equipment-image-${index}`}
                          type='file'
                          onChange={e => handleFileUpload(e.target.files, 'equipment', index)}
                        />
                        <label htmlFor={`equipment-image-${index}`}>
                          <IconButton component='span' size='small'>
                            <Icon icon='tabler:photo' />
                          </IconButton>
                        </label>
                      </Grid>
                      <Grid item xs={12} md={1}>
                        {equipments.length > 1 && (
                          <IconButton onClick={() => removeEquipment(index)} color='error' size='small'>
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                    {equipmentImages[index] && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={equipmentImages[index].name}
                          onDelete={() => {
                            const newImages = [...equipmentImages]
                            newImages[index] = undefined as any
                            setEquipmentImages(newImages)
                          }}
                          size='small'
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Vehicles Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={currentLang === 'ar' ? 'المركبات' : 'Vehicles'}
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Button startIcon={<Icon icon='tabler:plus' />} onClick={addVehicle} variant='outlined' size='small'>
                    {currentLang === 'ar' ? 'إضافة مركبة' : 'Add Vehicle'}
                  </Button>
                }
              />
              <CardContent>
                {vehicles.map((vehicle, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'النوع' : 'Type'}
                          value={vehicle.type}
                          onChange={e => handleVehicleChange(index, 'type', e.target.value)}
                          required
                          error={!vehicle.type}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'رقم اللوحة' : 'Plate Number'}
                          value={vehicle.plateNumber}
                          onChange={e => handleVehicleChange(index, 'plateNumber', e.target.value)}
                          required
                          error={!vehicle.plateNumber}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'اللون' : 'Color'}
                          value={vehicle.color}
                          onChange={e => handleVehicleChange(index, 'color', e.target.value)}
                          required
                          error={!vehicle.color}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <input
                          accept='image/*'
                          style={{ display: 'none' }}
                          id={`vehicle-image-${index}`}
                          type='file'
                          onChange={e => handleFileUpload(e.target.files, 'vehicle', index)}
                        />
                        <label htmlFor={`vehicle-image-${index}`}>
                          <IconButton component='span' size='small'>
                            <Icon icon='tabler:photo' />
                          </IconButton>
                        </label>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        {vehicles.length > 1 && (
                          <IconButton onClick={() => removeVehicle(index)} color='error' size='small'>
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                    {vehicleImages[index] && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={vehicleImages[index].name}
                          onDelete={() => {
                            const newImages = [...vehicleImages]
                            newImages[index] = undefined as any
                            setVehicleImages(newImages)
                          }}
                          size='small'
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant='outlined'>
          {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
          {loading ? (currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : currentLang === 'ar' ? 'حفظ' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddPermitModal
