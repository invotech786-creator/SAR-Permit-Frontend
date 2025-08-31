// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (t?: any): HorizontalNavItemsType => [
  {
    title: t ? t('Home') : 'Home',
    path: '/home',
    icon: 'tabler:home'
  },
  {
    title: t ? t('My Profile') : 'My Profile',
    path: '/profile',
    icon: 'tabler:user'
  },
  {
    title: t ? t('Users') : 'Users',
    path: '/users',
    icon: 'tabler:users',
    action: 'view',
    subject: 'user-management'
  },
  {
    title: t ? t('Roles & Permissions') : 'Roles & Permissions',
    path: '/roles',
    icon: 'tabler:lock',
    action: 'view',
    subject: 'role-management'
  },
  {
    title: t ? t('Job Titles') : 'Job Titles',
    path: '/jobtitles',
    icon: 'tabler:briefcase',
    action: 'view',
    subject: 'job-title-management'
  },
  {
    title: t ? t('Departments') : 'Departments',
    path: '/departments',
    icon: 'tabler:building',
    action: 'view',
    subject: 'department-management'
  },
  {
    title: t ? t('Permit System') : 'Permit System',
    path: '/permit-system',
    icon: 'tabler:clipboard-check',
    action: 'view',
    subject: 'permit-management'
  },
  {
    path: '/companies',
    title: t ? t('Companies') : 'Companies',
    icon: 'pixel:tech-companies',
    action: 'view',
    subject: 'company-management'
  }
]

export default navigation
