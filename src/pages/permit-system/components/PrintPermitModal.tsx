import React, { useRef, useEffect } from 'react'
import { IPermit } from 'src/types'
import { useTranslation } from 'react-i18next'

interface PrintPermitModalProps {
  open: boolean
  onClose: () => void
  permit: IPermit | null
}

const PrintPermitModal: React.FC<PrintPermitModalProps> = ({ open, onClose, permit }) => {
  const { t, i18n } = useTranslation()
  const printRef = useRef<HTMLDivElement>(null)
  const isArabic = i18n.language === 'ar'

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html dir="${isArabic ? 'rtl' : 'ltr'}">
            <head>
              <title>${isArabic ? 'تصريح العمل' : 'Work Permit'}</title>
                             <style>
                 body { 
                   font-family: ${isArabic ? 'Arial, sans-serif' : 'Arial, sans-serif'};
                   margin: 20px;
                   direction: ${isArabic ? 'rtl' : 'ltr'};
                   font-size: 16px;
                 }
                 .header { text-align: center; margin-bottom: 30px; }
                 .section { margin-bottom: 25px; }
                                   .section-title { 
                    font-weight: bold; 
                    margin-bottom: 15px; 
                    color: #fff; /* White text */
                    font-size: 18px;
                    padding: 12px 16px;
                    background: #00838f; /* Teal background */
                    border-radius: 8px;
                    text-align: center;
                    width: 100%;
                    display: block;
                    text-decoration: none;
                  }
                 .info-row { margin-bottom: 12px; }
                 .label { 
                   font-weight: bold; 
                   display: inline-block; 
                   width: 180px; 
                   font-size: 16px;
                 }
                 .value { 
                   display: inline-block; 
                   font-size: 16px;
                 }
                 .locations { margin-top: 15px; }
                 .location-chip { 
                   display: inline-block; 
                   background: #e3f2fd; 
                   padding: 6px 10px; 
                   margin: 3px; 
                   border-radius: 6px; 
                   border: 2px solid #1976d2;
                   font-size: 15px;
                 }
                 .table-container { margin-top: 15px; }
                                   .data-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    border: 1px solid #ccc;
                    font-size: 16px;
                  }
                  .data-table th { 
                    background: #f2f2f2; 
                    color: black; 
                    font-weight: bold; 
                    padding: 12px 8px; 
                    text-align: right; 
                    border: 1px solid #ccc;
                  }
                  .data-table td { 
                    padding: 10px 8px; 
                    border: 1px solid #ccc; 
                    text-align: right;
                  }
                  .row-even { background: #f2f2f2; }
                  .row-odd { background: white; }
                 @media print {
                   .no-print { display: none; }
                 }
               </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  // Auto-print when modal opens
  useEffect(() => {
    if (open && permit) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        handlePrint()
        onClose()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [open, permit])

  // Don't render anything since we're auto-printing
  if (!permit) return null

  // These functions are only used in the print content, not in the render
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isArabic ? date.toLocaleDateString('ar-SA') : date.toLocaleDateString('en-GB')
  }

  const getStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: isArabic ? 'قيد الانتظار' : 'Pending',
      1: isArabic ? 'موافق عليه' : 'Approved',
      2: isArabic ? 'مرفوض' : 'Rejected'
    }
    return statusMap[status] || status.toString()
  }

  const getStatusColor = (status: number) => {
    const colorMap: { [key: number]: string } = {
      0: 'warning',
      1: 'success',
      2: 'error'
    }
    return colorMap[status] || 'default'
  }

  // Render the content to DOM for printing, but hide it visually
  return (
    <div ref={printRef} style={{ display: 'none' }}>
      {/* Header */}
      <div className='header'>
        {/* Top section with logo and metadata */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}
        >
          {/* Left side - SAR Logo for English, empty for Arabic */}
          <div style={{ width: '120px', textAlign: isArabic ? 'left' : 'left' }}>
            {!isArabic && <img src='/images/auth/sar-logo.svg' alt='SAR Logo' style={{ maxWidth: '100px' }} />}
          </div>

          {/* Center - main titles */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '24px', margin: '0 0 16px 0' }}>
              {isArabic ? 'الخطوط الحديدية السعودية' : 'Saudi Arabia Railways'}
            </h1>
            {/* Dynamic Department Name */}
            {permit.startingDepartmentId && (
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
                {isArabic ? permit.startingDepartmentId.nameAr : permit.startingDepartmentId.nameEn}
              </h3>
            )}
            <h3 style={{ fontSize: '16px', color: '#666', margin: '0' }}>
              {isArabic ? 'تصريح العمل رقم:' : 'Work Permit No:'} {permit.number || '-'}
            </h3>
          </div>

          {/* Right side - SAR Logo for Arabic, empty for English */}
          <div style={{ width: '120px', textAlign: isArabic ? 'right' : 'right' }}>
            {isArabic && <img src='/images/auth/sar-logo.svg' alt='SAR Logo' style={{ maxWidth: '100px' }} />}
          </div>
        </div>
      </div>

      {/* Permit Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Basic Information */}
        <div>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'نوع التصريح:' : 'Permit Type:'}</span>
              <span className='value'>{permit.type}</span>
            </div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'الغرض:' : 'Purpose:'}</span>
              <span className='value'>{isArabic ? permit.purposeAr : permit.purposeEn}</span>
            </div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'الحالة:' : 'Status:'}</span>
              <span className='value'>{getStatusText(permit.currentStatus)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'التواريخ' : 'Dates'}</div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'تاريخ البداية:' : 'Start Date:'}</span>
              <span className='value'>{formatDate(permit.startDate)}</span>
            </div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'تاريخ الانتهاء:' : 'End Date:'}</span>
              <span className='value'>{formatDate(permit.endDate)}</span>
            </div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'تاريخ الإنشاء:' : 'Created At:'}</span>
              <span className='value'>{formatDate(permit.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'معلومات الشركة' : 'Company Information'}</div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'اسم الشركة:' : 'Company Name:'}</span>
              <span className='value'>{isArabic ? permit.companyId.nameAr : permit.companyId.nameEn}</span>
            </div>
          </div>
        </div>

        {/* Responsible Person */}
        <div>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'الشخص المسؤول' : 'Responsible Person'}</div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'الاسم:' : 'Name:'}</span>
              <span className='value'>{isArabic ? permit.responsibleId.nameAr : permit.responsibleId.nameEn}</span>
            </div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'رقم الهاتف:' : 'Phone:'}</span>
              <span className='value'>{permit.responsibleId.phone}</span>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'المواقع' : 'Locations'}</div>
            <div className='locations'>
              {permit.locations.map((location, index) => (
                <span key={index} className='location-chip'>
                  {isArabic ? location.nameAr : location.nameEn}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Table */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'بيان المعدات' : 'Equipment Details'}</div>
            <div className='table-container'>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>{isArabic ? 'م' : 'No.'}</th>
                    <th>{isArabic ? 'المعدات' : 'Equipment'}</th>
                    <th>{isArabic ? 'الوصف' : 'Description'}</th>
                    <th>{isArabic ? 'العدد' : 'Count'}</th>
                  </tr>
                </thead>
                <tbody>
                  {permit.equipments && permit.equipments.length > 0 ? (
                    permit.equipments.map((equipment, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td>{index + 1}</td>
                        <td>{isArabic ? equipment.nameAr : equipment.nameEn}</td>
                        <td>{isArabic ? equipment.descriptionAr : equipment.descriptionEn}</td>
                        <td>{equipment.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className='row-even'>
                      <td colSpan={4} style={{ textAlign: 'center' }}>
                        {isArabic ? 'لا توجد معدات' : 'No equipment available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'بيان المركبات' : 'Vehicle Details'}</div>
            <div className='table-container'>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>{isArabic ? 'م' : 'No.'}</th>
                    <th>{isArabic ? 'نوع المركبة' : 'Vehicle Type'}</th>
                    <th>{isArabic ? 'رقم اللوحة' : 'Plate Number'}</th>
                    <th>{isArabic ? 'اللون' : 'Color'}</th>
                  </tr>
                </thead>
                <tbody>
                  {permit.vehicles && permit.vehicles.length > 0 ? (
                    permit.vehicles.map((vehicle, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td>{index + 1}</td>
                        <td>{vehicle.type}</td>
                        <td>{vehicle.plateNumber}</td>
                        <td>{vehicle.color}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className='row-even'>
                      <td colSpan={4} style={{ textAlign: 'center' }}>
                        {isArabic ? 'لا توجد مركبات' : 'No vehicles available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* People Table */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'بيان بأسماء الاشخاص' : 'Statement of Names of Persons'}</div>
            <div className='table-container'>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>{isArabic ? 'م' : 'No.'}</th>
                    <th>{isArabic ? 'الاسم' : 'Name'}</th>
                    <th>{isArabic ? 'الجنسية' : 'Nationality'}</th>
                    <th>{isArabic ? 'رقم الهوية' : 'ID Number'}</th>
                  </tr>
                </thead>
                <tbody>
                  {permit.people && permit.people.length > 0 ? (
                    permit.people.map((person, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td>{index + 1}</td>
                        <td>{isArabic ? person.nameAr : person.nameEn}</td>
                        <td>{person.nationality}</td>
                        <td>{person.nationalId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className='row-even'>
                      <td colSpan={4} style={{ textAlign: 'center' }}>
                        {isArabic ? 'لا يوجد أشخاص' : 'No people available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Created By */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className='section'>
            <div className='section-title'>{isArabic ? 'تمت الإضافة بواسطة' : 'Added By'}</div>
            <div className='info-row'>
              <span className='label'>{isArabic ? 'المستخدم:' : 'User:'}</span>
              <span className='value'>{isArabic ? permit.createdBy.nameAr : permit.createdBy.nameEn}</span>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ margin: '24px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <p style={{ margin: '0 0 8px 0', color: '#666' }}>
          {isArabic
            ? 'تم إنشاء هذا التصريح بواسطة نظام التصاريح الإلكتروني'
            : 'This permit was generated by the electronic permit system'}
        </p>
        <p style={{ margin: '0', color: '#666' }}>
          {isArabic ? 'تاريخ الطباعة:' : 'Print Date:'}{' '}
          {isArabic ? new Date().toLocaleDateString('ar-SA') : new Date().toLocaleDateString('en-GB')}
        </p>
      </div>
    </div>
  )
}

export default PrintPermitModal
