export const arabicNameOrNumberPattern = /^[\u0600-\u06FF0-9\s\p{P}\p{S}]+$/u
export const englishNameOrNumberPattern = /^[A-Za-z0-9\s\p{P}\p{S}]+$/u

// Strict validation patterns that prevent mixing languages
export const strictArabicOnlyPattern = /^[\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9\s\.,!?;:()\[\]{}"'\-+*/@#$%^&|\\~`]+$/u
export const strictEnglishOnlyPattern = /^[A-Za-z0-9\s\.,!?;:()\[\]{}"'\-+*/@#$%^&|\\~`]+$/u

export const fieldRequiredMessage = 'Field is required'
export const arabicCharacterRequiredMessage = 'Can contain only Arabic letters, numbers, or symbols'
export const englishCharacterRequiredMessage = 'Can contain only English letters, numbers, or symbols'
export const strictArabicOnlyMessage = 'Must contain only Arabic characters'
export const strictEnglishOnlyMessage = 'Must contain only English characters'

// Numeric input validation helpers
export const preventNonNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Prevent 'e', 'E', '+', '-' in number inputs (scientific notation chars)
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault()
  }
}

export const preventInvalidDecimalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Prevent 'e', 'E', '+', '-' and allow decimal point
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault()
  }
}
