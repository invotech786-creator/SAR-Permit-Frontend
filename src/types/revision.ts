export interface IRevision {
  _id: string
  action: 'create' | 'update' | 'delete'
  modelName: string
  documentId: string
  changes?: Record<string, { old: any; new: any }>
  timestamp: string
  user?: {
    _id: string
    nameEn?: string
    nameAr?: string
    username?: string
  }
  // Additional properties used by history modals
  operation?: 'create' | 'edit' | 'delete'
  fieldName?: string
  previousValue?: any
  currentValue?: any
  modifiedBy?: any
  modificationDate?: string
}

export interface IRevisionResponse {
  revisions: IRevision[]
  current: number
  pages: number
  total: number
}
