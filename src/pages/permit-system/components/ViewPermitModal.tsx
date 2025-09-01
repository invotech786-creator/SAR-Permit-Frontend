import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Paper,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import { IPermit } from 'src/types'

interface ViewPermitModalProps {
  open: boolean
  onClose: () => void
  permit: IPermit | null
}

const ViewPermitModal: React.FC<ViewPermitModalProps> = ({ open, onClose, permit }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // Get localized text helper
  const getLocalizedText = (enText: string, arText: string) => {
    return currentLang === 'ar' ? arText : enText
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'pending review':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (!permit) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xl'
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1, position: 'relative' }}>
        <Typography variant='h5' component='span' sx={{ textAlign: 'center', display: 'block' }}>
          {t('Permit Details')} - {permit.number}
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

      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={3}>
          {/* Header Information */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3, backgroundColor: 'primary.50' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} md={6}>
                  <Typography variant='h6' color='primary' gutterBottom>
                    {t('Permit Number')}: {permit.number}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    {t('Type')}:{' '}
                    {permit.type === 'entry'
                      ? currentLang === 'ar'
                        ? 'دخول'
                        : 'Entry'
                      : permit.type === 'exit'
                      ? currentLang === 'ar'
                        ? 'خروج'
                        : 'Exit'
                      : permit.type === 'entry and exit'
                      ? currentLang === 'ar'
                        ? 'دخول وخروج'
                        : 'Entry and Exit'
                      : permit.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                  <Chip
                    label={
                      permit.currentStatus === 0
                        ? currentLang === 'ar'
                          ? 'قيد المراجعة'
                          : 'Pending Review'
                        : permit.currentStatus === 1
                        ? currentLang === 'ar'
                          ? 'موافق'
                          : 'Approved'
                        : permit.currentStatus === 2
                        ? currentLang === 'ar'
                          ? 'مرفوض'
                          : 'Declined'
                        : currentLang === 'ar'
                        ? 'قيد المراجعة'
                        : 'Pending Review'
                    }
                    color={
                      permit.currentStatus === 0
                        ? 'warning'
                        : permit.currentStatus === 1
                        ? 'success'
                        : permit.currentStatus === 2
                        ? 'error'
                        : 'warning'
                    }
                    size='medium'
                    sx={{ fontSize: '1rem', px: 2, py: 1 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Basic Information Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={t('Basic Information')}
                titleTypographyProps={{ variant: 'h6' }}
                avatar={<Icon icon='tabler:info-circle' color='primary' />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Company')}
                      </Typography>
                      <Typography variant='body1'>
                        {getLocalizedText(permit.companyId?.nameEn || '', permit.companyId?.nameAr || '')}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Purpose')}
                      </Typography>
                      <Typography variant='body1'>
                        {getLocalizedText(permit.purposeEn || '', permit.purposeAr || '')}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Starting Department')}
                      </Typography>
                      <Typography variant='body1'>
                        {getLocalizedText(
                          permit.startingDepartmentId?.nameEn || '',
                          permit.startingDepartmentId?.nameAr || ''
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Responsible Person')}
                      </Typography>
                      <Typography variant='body1'>
                        {getLocalizedText(permit.responsibleId?.nameEn || '', permit.responsibleId?.nameAr || '')}
                      </Typography>
                      {permit.responsibleId?.email && (
                        <Typography variant='body2' color='text.secondary'>
                          {permit.responsibleId.email}
                        </Typography>
                      )}
                      {permit.responsibleId?.phone && (
                        <Typography
                          variant='body2'
                          color='primary'
                          sx={{
                            direction: 'ltr', // Force LTR for phone numbers to ensure + is at the start
                            unicodeBidi: 'plaintext', // Ensure proper text direction handling
                            textAlign: 'left' // Align to the left for proper phone number display
                          }}
                        >
                          {permit.responsibleId.phone && !permit.responsibleId.phone.startsWith('+')
                            ? `+${permit.responsibleId.phone}`
                            : permit.responsibleId.phone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dates and Locations Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={t('Schedule & Locations')}
                titleTypographyProps={{ variant: 'h6' }}
                avatar={<Icon icon='tabler:calendar' color='primary' />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Start Date')}
                      </Typography>
                      <Typography variant='body1'>{formatDate(permit.startDate)}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('End Date')}
                      </Typography>
                      <Typography variant='body1'>{formatDate(permit.endDate)}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Locations')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {permit.locations?.map((location, index) => (
                          <Chip
                            key={index}
                            label={getLocalizedText(location.nameEn || '', location.nameAr || '')}
                            variant='outlined'
                            color='primary'
                            size='small'
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        {t('Created At')}
                      </Typography>
                      <Typography variant='body1'>{formatDate(permit.createdAt)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* People Section */}
          {permit.people && permit.people.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('People')}
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={<Icon icon='tabler:users' color='primary' />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {permit.people.map((person, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper elevation={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              <Icon icon='tabler:user' />
                            </Avatar>
                            <Box>
                              <Typography variant='subtitle1' fontWeight='bold'>
                                {getLocalizedText(person.nameEn || '', person.nameAr || '')}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('Nationality')}
                              </Typography>
                              <Typography variant='body2'>{person.nationality}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('National ID')}
                              </Typography>
                              <Typography variant='body2'>{person.nationalId}</Typography>
                            </Grid>
                          </Grid>

                          {/* Person Images */}
                          {permit.peopleImages && permit.peopleImages[index] && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant='caption' color='text.secondary' gutterBottom>
                                {t('Photo')}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <img
                                  src={permit.peopleImages[index]}
                                  alt={`${person.nameAr || person.nameEn} photo`}
                                  style={{
                                    width: '100%',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Equipment Section */}
          {permit.equipments && permit.equipments.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('Equipment')}
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={<Icon icon='tabler:tools' color='primary' />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {permit.equipments.map((equipment, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper elevation={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              <Icon icon='tabler:package' />
                            </Avatar>
                            <Box>
                              <Typography variant='subtitle1' fontWeight='bold'>
                                {getLocalizedText(equipment.nameEn || '', equipment.nameAr || '')}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('Count')}
                              </Typography>
                              <Typography variant='body2'>{equipment.count}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('Description')}
                              </Typography>
                              <Typography variant='body2'>
                                {getLocalizedText(equipment.descriptionEn || '', equipment.descriptionAr || '')}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Equipment Images */}
                          {permit.equipmentImages && permit.equipmentImages[index] && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant='caption' color='text.secondary' gutterBottom>
                                {t('Image')}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <img
                                  src={permit.equipmentImages[index]}
                                  alt={`${equipment.nameAr || equipment.nameEn} image`}
                                  style={{
                                    width: '100%',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Vehicles Section */}
          {permit.vehicles && permit.vehicles.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('Vehicles')}
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={<Icon icon='tabler:car' color='primary' />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {permit.vehicles.map((vehicle, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper elevation={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                              <Icon icon='tabler:car' />
                            </Avatar>
                            <Box>
                              <Typography variant='subtitle1' fontWeight='bold'>
                                {vehicle.type}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {vehicle.plateNumber}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('Plate Number')}
                              </Typography>
                              <Typography variant='body2'>{vehicle.plateNumber}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant='caption' color='text.secondary'>
                                {t('Color')}
                              </Typography>
                              <Typography variant='body2'>{vehicle.color}</Typography>
                            </Grid>
                          </Grid>

                          {/* Vehicle Images */}
                          {permit.vehicleImages && permit.vehicleImages[index] && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant='caption' color='text.secondary' gutterBottom>
                                {t('Image')}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <img
                                  src={permit.vehicleImages[index]}
                                  alt={`${vehicle.type} ${vehicle.plateNumber} image`}
                                  style={{
                                    width: '100%',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* All Images Gallery */}
          {(permit.peopleImages?.some(img => img) ||
            permit.equipmentImages?.some(img => img) ||
            permit.vehicleImages?.some(img => img)) && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('Image Gallery')}
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={<Icon icon='tabler:photo' color='primary' />}
                />
                <CardContent>
                  <ImageList cols={3} gap={16}>
                    {/* People Images */}
                    {permit.peopleImages?.map(
                      (image, index) =>
                        image && (
                          <ImageListItem key={`people-${index}`}>
                            <img
                              src={image}
                              alt={`Person ${index + 1} photo`}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <ImageListItemBar title={`${t('Person')} ${index + 1}`} subtitle={t('Photo')} />
                          </ImageListItem>
                        )
                    )}

                    {/* Equipment Images */}
                    {permit.equipmentImages?.map(
                      (image, index) =>
                        image && (
                          <ImageListItem key={`equipment-${index}`}>
                            <img
                              src={image}
                              alt={`Equipment ${index + 1} image`}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <ImageListItemBar title={`${t('Equipment')} ${index + 1}`} subtitle={t('Image')} />
                          </ImageListItem>
                        )
                    )}

                    {/* Vehicle Images */}
                    {permit.vehicleImages?.map(
                      (image, index) =>
                        image && (
                          <ImageListItem key={`vehicle-${index}`}>
                            <img
                              src={image}
                              alt={`Vehicle ${index + 1} image`}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <ImageListItemBar title={`${t('Vehicle')} ${index + 1}`} subtitle={t('Image')} />
                          </ImageListItem>
                        )
                    )}
                  </ImageList>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant='outlined'>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewPermitModal
