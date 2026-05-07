import { computed } from 'vue'
import { appSettings, saveAppSettings } from '@/config/appSettings'
import en from './en'
import vi from './vi'

export const languages = {
  vi,
  en,
}

export const languageOptions = [
  { value: 'vi', labelKey: 'settings.vietnamese' },
  { value: 'en', labelKey: 'settings.english' },
]

export const currentLanguage = computed(() => appSettings.language || 'vi')

function lookup(path, dictionary) {
  return path.split('.').reduce((value, key) => value?.[key], dictionary)
}

export function t(path, replacements = {}) {
  const dictionary = languages[currentLanguage.value] || languages.vi
  const fallback = languages.en
  let value = lookup(path, dictionary) ?? lookup(path, fallback) ?? path

  Object.entries(replacements).forEach(([key, replacement]) => {
    value = value.replaceAll(`{${key}}`, String(replacement))
  })

  return value
}

export function setLanguage(language) {
  saveAppSettings({ language: languages[language] ? language : 'vi' })
}
