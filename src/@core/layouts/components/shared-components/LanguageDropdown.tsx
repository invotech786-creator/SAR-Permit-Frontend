import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import OptionsMenu from 'src/@core/components/option-menu'
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const LanguageDropdown = ({ settings, saveSettings }: Props) => {
  // ** Hook
  const { i18n } = useTranslation()

  const handleLangItemClick = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang)
    // Save to localStorage to persist on refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lang)
    }
  }

  return (
    <OptionsMenu
      iconButtonProps={{ color: 'inherit' }}
      icon={<Icon fontSize='1.5rem' icon='tabler:language' />}
      menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4.5, minWidth: 130 } } }}
      options={[
        {
          text: 'English',
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'en',
            onClick: () => {
              handleLangItemClick('en')
              saveSettings({ ...settings, direction: 'ltr' })
            }
          }
        },
        {
          text: 'Arabic',
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'ar',
            onClick: () => {
              handleLangItemClick('ar')
              saveSettings({ ...settings, direction: 'rtl' })
            }
          }
        }
      ]}
    />
  )
}

export default LanguageDropdown
