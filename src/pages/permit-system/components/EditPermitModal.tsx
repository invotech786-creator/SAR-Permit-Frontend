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
  Card,
  CardContent,
  CardHeader,
  OutlinedInput
} from '@mui/material'

import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import { permitService } from 'src/services/permitService'
import useUserStore from 'src/store/useUserStore'
import useCompanyStore from 'src/store/useCompanyStore'
import useLocationStore from 'src/store/useLocationStore'
import { showErrorMessage, showSuccessMessage } from 'src/components'
import { IDepartment, ICompany, IUser, ILocation, IPerson, IEquipment, IVehicle, IPermit } from 'src/types'

interface EditPermitModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onStatusUpdate: () => void
  permit: IPermit | null
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

const EditPermitModal: React.FC<EditPermitModalProps> = ({ open, onClose, onSuccess, onStatusUpdate, permit }) => {
  const { t, i18n } = useTranslation()
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
    locations: [] as string[],
    currentStatus: 0
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

  // State for decline dialog
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedPersonForDecline, setSelectedPersonForDecline] = useState<{
    index: number
    person: PersonFormData
  } | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [declineLoading, setDeclineLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  // Populate form when permit data changes
  useEffect(() => {
    if (permit && open) {
      populateFormWithPermitData()
    }
  }, [permit, open])

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
      setDepartments(deps)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  const populateFormWithPermitData = () => {
    if (!permit) return

    setFormData({
      companyId: typeof permit.companyId === 'string' ? permit.companyId : permit.companyId._id,
      purposeAr: permit.purposeAr,
      purposeEn: permit.purposeEn,
      type: permit.type,
      workPermitType: (permit as any).workPermitType || '',
      startingDepartmentId:
        typeof permit.startingDepartmentId === 'string' ? permit.startingDepartmentId : permit.startingDepartmentId._id,
      startDate: new Date(permit.startDate),
      endDate: new Date(permit.endDate),
      responsibleId: typeof permit.responsibleId === 'string' ? permit.responsibleId : permit.responsibleId._id,
      locations: permit.locations.map(loc => (typeof loc === 'string' ? loc : loc._id)),
      currentStatus: permit.currentStatus
    })

    // Populate people
    if (permit.people && permit.people.length > 0) {
      setPeople(
        permit.people.map(person => ({
          nameAr: person.nameAr,
          nameEn: person.nameEn || '',
          nationality: person.nationality,
          nationalId: person.nationalId
        }))
      )
    }

    // Populate equipment
    if (permit.equipments && permit.equipments.length > 0) {
      setEquipments(
        permit.equipments.map(equipment => ({
          nameAr: equipment.nameAr,
          nameEn: equipment.nameEn,
          descriptionAr: equipment.descriptionAr,
          descriptionEn: equipment.descriptionEn,
          count: equipment.count
        }))
      )
    }

    // Populate vehicles
    if (permit.vehicles && permit.vehicles.length > 0) {
      setVehicles(
        permit.vehicles.map(vehicle => ({
          type: vehicle.type,
          plateNumber: vehicle.plateNumber,
          color: vehicle.color
        }))
      )
    }

    // Reset images
    setPeopleImages([])
    setEquipmentImages([])
    setVehicleImages([])
  }

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Update permit status immediately when status changes
    if (field === 'currentStatus' && permit) {
      updatePermitStatus(permit._id, value)
    }
  }

  // Update permit status via API
  const updatePermitStatus = async (permitId: string, status: number) => {
    try {
      const formData = new URLSearchParams()
      formData.append('status', status.toString())

      await permitService.updatePermitStatus(permitId, formData)
      showSuccessMessage('Permit status updated successfully')

      // Notify parent component to refresh the permit list
      onStatusUpdate()
    } catch (error) {
      console.error('Error updating permit status:', error)
      showErrorMessage('Failed to update permit status')
    }
  }

  // Handle person decline
  const handlePersonDecline = (index: number, person: PersonFormData) => {
    setSelectedPersonForDecline({ index, person })
    setDeclineDialogOpen(true)
  }

  // Decline person via API
  const declinePerson = async () => {
    if (!selectedPersonForDecline || !permit || !declineReason.trim()) return

    try {
      setDeclineLoading(true)

      // Get the person ID from the original permit data
      const originalPerson = permit.people[selectedPersonForDecline.index]
      const personId = typeof originalPerson === 'string' ? originalPerson : originalPerson._id

      await permitService.declinePerson(permit._id, personId, declineReason.trim())

      showSuccessMessage('Person declined successfully')
      setDeclineDialogOpen(false)
      setSelectedPersonForDecline(null)
      setDeclineReason('')

      // Remove the declined person from the local state
      const newPeople = people.filter((_, i) => i !== selectedPersonForDecline.index)
      setPeople(newPeople)

      // Also remove the corresponding image
      const newImages = peopleImages.filter((_, i) => i !== selectedPersonForDecline.index)
      setPeopleImages(newImages)
    } catch (error) {
      console.error('Error declining person:', error)
      showErrorMessage('Failed to decline person')
    } finally {
      setDeclineLoading(false)
    }
  }

  // Close decline dialog
  const closeDeclineDialog = () => {
    setDeclineDialogOpen(false)
    setSelectedPersonForDecline(null)
    setDeclineReason('')
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
    if (!permit) return

    try {
      setLoading(true)

      // Validate required fields
      if (
        !formData.companyId ||
        !formData.purposeAr ||
        !formData.purposeEn ||
        !formData.type ||
        !formData.workPermitType ||
        !formData.startDate ||
        !formData.endDate
      ) {
        showErrorMessage('Please fill in all required fields')
        return
      }

      // Validate date constraints
      if (formData.endDate <= formData.startDate) {
        showErrorMessage('End date must be after start date')
        return
      }

      // Create permit data object for the service
      const permitData = {
        companyId: formData.companyId,
        purposeAr: formData.purposeAr,
        purposeEn: formData.purposeEn,
        type: formData.type,
        workPermitType: formData.workPermitType,
        startingDepartmentId: formData.startingDepartmentId,
        startDate: formData.startDate!.toISOString().split('T')[0],
        endDate: formData.endDate!.toISOString().split('T')[0],
        responsibleId: formData.responsibleId,
        currentStatus: formData.currentStatus,
        locations: formData.locations,
        people: people.filter(p => p.nameAr && p.nationality && p.nationalId),
        equipments: equipments.filter(e => e.nameAr && e.nameEn),
        vehicles: vehicles.filter(v => v.type && v.plateNumber && v.color)
      }

      await permitService.updatePermit(permit._id, permitData as any)

      showSuccessMessage('Permit updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating permit:', error)
      showErrorMessage('Failed to update permit')
    } finally {
      setLoading(false)
    }
  }

  // Get localized text helper
  const getLocalizedText = (enText: string, arText: string) => {
    return currentLang === 'ar' ? arText : enText
  }

  // Get status text
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return currentLang === 'ar' ? 'قيد المراجعة' : 'Pending'
      case 1:
        return currentLang === 'ar' ? 'موافق' : 'Approved'
      case 2:
        return currentLang === 'ar' ? 'مرفوض' : 'Declined'
      default:
        return currentLang === 'ar' ? 'قيد المراجعة' : 'Pending'
    }
  }

  if (!permit) {
    return null
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
          {currentLang === 'ar' ? 'تعديل التصريح' : 'Edit Permit'}
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
                      >
                        {companies.map(company => (
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
                      onChange={e => handleFormChange('purposeAr', e.target.value)}
                      required
                      error={!formData.purposeAr}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={currentLang === 'ar' ? 'الهدف (إنجليزي)' : 'Purpose (English)'}
                      value={formData.purposeEn}
                      onChange={e => handleFormChange('purposeEn', e.target.value)}
                      required
                      error={!formData.purposeEn}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{currentLang === 'ar' ? 'قسم البداية' : 'Starting Department'}</InputLabel>
                      <Select
                        value={formData.startingDepartmentId}
                        onChange={e => handleFormChange('startingDepartmentId', e.target.value)}
                        label={currentLang === 'ar' ? 'قسم البداية' : 'Starting Department'}
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
                        if (formData.endDate && date && formData.endDate < date) {
                          handleFormChange('endDate', null)
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!formData.startDate}
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
                          : new Date().toISOString().split('T')[0]
                      }}
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!formData.endDate}
                      disabled={!formData.startDate}
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
                      <InputLabel>{currentLang === 'ar' ? 'حالة التصريح' : 'Permit Status'}</InputLabel>
                      <Select
                        value={formData.currentStatus}
                        onChange={e => handleFormChange('currentStatus', e.target.value)}
                        label={currentLang === 'ar' ? 'حالة التصريح' : 'Permit Status'}
                      >
                        <MenuItem value={0}>{getStatusText(0)}</MenuItem>
                        <MenuItem value={1}>{getStatusText(1)}</MenuItem>
                        <MenuItem value={2}>{getStatusText(2)}</MenuItem>
                      </Select>
                    </FormControl>
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
                      <Grid item xs={12} md={2.5}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                          value={person.nameAr}
                          onChange={e => handlePeopleChange(index, 'nameAr', e.target.value)}
                          required
                          error={!person.nameAr}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.5}>
                        <TextField
                          fullWidth
                          label={currentLang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                          value={person.nameEn}
                          onChange={e => handlePeopleChange(index, 'nameEn', e.target.value)}
                          helperText={currentLang === 'ar' ? 'اختياري' : 'Optional'}
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
                        <IconButton
                          onClick={() => handlePersonDecline(index, person)}
                          color='warning'
                          size='small'
                          title={currentLang === 'ar' ? 'رفض الشخص' : 'Decline Person'}
                        >
                          <Icon icon='tabler:ban' />
                        </IconButton>
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

          {/* Vehicle Section */}
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
                      <Grid item xs={12} md={3}>
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
                      <Grid item xs={12} md={1}>
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

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='outlined'>
          {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <Icon icon='tabler:loader-2' /> : <Icon icon='tabler:check' />}
        >
          {loading
            ? currentLang === 'ar'
              ? 'جاري التحديث...'
              : 'Updating...'
            : currentLang === 'ar'
            ? 'تحديث التصريح'
            : 'Update Permit'}
        </Button>
      </DialogActions>

      {/* Decline Person Dialog */}
      <Dialog open={declineDialogOpen} onClose={closeDeclineDialog} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentLang === 'ar' ? 'رفض الشخص' : 'Decline Person'}
          <IconButton onClick={closeDeclineDialog} size='small'>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant='body2' sx={{ mb: 2 }}>
              {currentLang === 'ar'
                ? `هل أنت متأكد من رفض "${
                    selectedPersonForDecline?.person.nameAr || selectedPersonForDecline?.person.nameEn
                  }"؟`
                : `Are you sure you want to decline "${
                    selectedPersonForDecline?.person.nameAr || selectedPersonForDecline?.person.nameEn
                  }"?`}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={currentLang === 'ar' ? 'سبب الرفض' : 'Decline Reason'}
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder={currentLang === 'ar' ? 'أدخل سبب الرفض...' : 'Enter decline reason...'}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeclineDialog} variant='outlined'>
            {currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={declinePerson}
            variant='contained'
            color='warning'
            disabled={declineLoading || !declineReason.trim()}
            startIcon={declineLoading ? <Icon icon='tabler:loader-2' /> : <Icon icon='tabler:ban' />}
          >
            {declineLoading
              ? currentLang === 'ar'
                ? 'جاري الرفض...'
                : 'Declining...'
              : currentLang === 'ar'
              ? 'رفض'
              : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default EditPermitModal
