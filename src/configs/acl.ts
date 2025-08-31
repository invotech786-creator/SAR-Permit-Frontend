import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'view' | 'bulk-delete' | 'toggle-activity'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (user: any, _subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  // Check if user has full permissions or is super admin
  if (user?.has_full_permission || user?.role?.isSuperAdmin) {
    can('manage', 'all')
    return rules
  }

  // Parse permissions from user.permissions array (format: "subject:action")
  if (user?.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach((permission: string) => {
      const [subject, action] = permission.split(':')
      if (subject && action) {
        can(action, subject)
      }
    })
  }

  return rules
}

export const buildAbilityFor = (user: any, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(user, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
