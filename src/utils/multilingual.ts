import { useRouter } from 'next/router'

/**
 * Get the appropriate text based on current locale
 */
export const getLocalizedText = (textEn?: string, textAr?: string, locale?: string): string => {
  // If no locale provided, try to get it from Next.js router
  if (!locale && typeof window !== 'undefined') {
    // Default to 'en' if we can't determine locale
    locale = 'en'
  }
  
  const isArabic = locale === 'ar'
  
  // Return Arabic text if locale is Arabic and textAr exists, otherwise return English
  if (isArabic && textAr) {
    return textAr
  }
  
  return textEn || textAr || ''
}

/**
 * Get bilingual display text (En / Ar)
 */
export const getBilingualText = (textEn?: string, textAr?: string): string => {
  if (textEn && textAr) {
    return `${textEn} / ${textAr}`
  }
  
  return textEn || textAr || ''
}

/**
 * React hook to get localized text
 */
export const useLocalizedText = () => {
  const router = useRouter()
  const locale = router.locale || 'en'
  
  const getLocalizedText = (textEn?: string, textAr?: string): string => {
    const isArabic = locale === 'ar'
    
    if (isArabic && textAr) {
      return textAr
    }
    
    return textEn || textAr || ''
  }
  
  const getBilingualText = (textEn?: string, textAr?: string): string => {
    if (textEn && textAr) {
      return `${textEn} / ${textAr}`
    }
    
    return textEn || textAr || ''
  }
  
  return {
    getLocalizedText,
    getBilingualText,
    locale,
    isArabic: locale === 'ar'
  }
}

/**
 * Get role display name based on locale
 */
export const getRoleDisplayName = (role: { nameEn?: string; nameAr?: string }, locale?: string): string => {
  return getLocalizedText(role.nameEn, role.nameAr, locale)
}

/**
 * Get role bilingual display name
 */
export const getRoleBilingualName = (role: { nameEn?: string; nameAr?: string }): string => {
  return getBilingualText(role.nameEn, role.nameAr)
}

/**
 * Get role description based on locale
 */
export const getRoleDescription = (role: { descriptionEn?: string; descriptionAr?: string; description?: string }, locale?: string): string => {
  // Handle both old and new schema
  const descEn = role.descriptionEn || role.description
  const descAr = role.descriptionAr
  
  return getLocalizedText(descEn, descAr, locale)
}

/**
 * Get role bilingual description
 */
export const getRoleBilingualDescription = (role: { descriptionEn?: string; descriptionAr?: string; description?: string }): string => {
  const descEn = role.descriptionEn || role.description
  const descAr = role.descriptionAr
  
  return getBilingualText(descEn, descAr)
}