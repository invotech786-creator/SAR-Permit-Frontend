export interface IRole {
  _id: string
  nameEn: string
  nameAr: string
  descriptionEn?: string
  descriptionAr?: string
  permissions: string[] // Array of permission IDs
  has_full_permission: boolean
  isSuperAdmin: boolean
  isActive: boolean
  createdBy?: string
  modifiedBy?: string
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  users?: any[]
}

export interface IRolePayload {
  nameEn: string
  nameAr: string
  descriptionEn?: string
  descriptionAr?: string
  permissions: string[] // Array of permission IDs
  has_full_permission?: boolean
  isSuperAdmin?: boolean
  isActive?: boolean
}