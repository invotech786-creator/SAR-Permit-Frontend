export interface IDepartment {
  _id: string
  nameAr: string
  nameEn: string
  isActive: boolean
  createdBy: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

export interface ICompany {
  _id: string
  nameAr: string
  nameEn: string
}

export interface IUser {
  _id: string
  nameAr: string
  nameEn: string
  email: string
  phone: string
  username: string
}

export interface ILocation {
  _id: string
  nameAr: string
  nameEn: string
}

export interface IPerson {
  _id: string
  nameAr: string
  nameEn?: string
  nationality: string
  nationalId: string
  status: number
  statusChangedAt: string | null
  statusChangedByUser: string | null
  statusChangedByDepartment: string | null
}

export interface IEquipment {
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  count: number
}

export interface IVehicle {
  type: string
  plateNumber: string
  color: string
}

export interface ICurrentLevel {
  _id: string
  departmentId: IDepartment
  sequence: number
}

export interface IPermit {
  _id: string
  companyId: ICompany
  purposeAr: string
  purposeEn: string
  number: string
  type: string
  workPermitType?: string
  startingDepartmentId: IDepartment
  startDate: string
  endDate: string
  responsibleId: IUser
  locations: ILocation[]
  people: IPerson[]
  equipments: IEquipment[]
  vehicles: IVehicle[]
  currentLevel: ICurrentLevel
  currentStatus: number
  finalStatus: number
  createdBy: IUser
  modifiedBy: IUser
  isDeleted: boolean
  history: any[]
  createdAt: string
  updatedAt: string
  __v: number
  peopleImages?: string[]
  equipmentImages?: string[]
  vehicleImages?: string[]
  status?: string
}

export interface IPermitResponse {
  permits: IPermit[]
  pagination: {
    current: number
    pages: number
    total: number
  }
}

export interface IPermitStatusCounts {
  all: number
  pending_review: number
  pending_safety_approval: number
  pending_facilities_approval: number
  pending_industrial_security_approval: number
}

export interface IPermitFilters {
  type?: string
  workPermitType?: string
  startDate?: string
  endDate?: string
  createdAtFrom?: string
  createdAtTo?: string
  number?: string
  purpose?: string
  createdBy?: string
  responsibleId?: string
  page?: number
  limit?: number
}