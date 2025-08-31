export interface IUser {
  _id: string
  nameAr: string
  nameEn: string
  email: string
  phone: string
  username: string
  role?: {
    _id: string
    nameEn: string
    nameAr: string
    descriptionEn?: string
    descriptionAr?: string
    permissions?: {
      [category: string]: {
        [action: string]: boolean
      }
    }
    has_full_permission?: boolean
    isSuperAdmin?: boolean
    isActive?: boolean
  }
  jobTitle?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  jobTitleId?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  company?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  companyId?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  department?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  departmentId?:
    | {
        _id: string
        nameAr: string
        nameEn: string
      }
    | string
  createdBy?: {
    _id: string
    nameEn: string
    username: string
  }
  modifiedBy?: {
    _id: string
    nameEn: string
    username: string
  }
  profilePic?: string
  isActive?: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  __v: number
  has_full_permission?: boolean
  permissions?: string[]
  groupedPermissions?: {
    [category: string]: {
      [action: string]: boolean
    }
  }
  roleId?: string
}

export interface IUserPayload {
  nameAr: string
  nameEn: string
  email: string
  phone: string
  username: string
  password?: string
  roleId: string
  jobTitleId?: string
  companyId?: string
  departmentId?: string
  isActive?: boolean
  profilePic?: File
}
