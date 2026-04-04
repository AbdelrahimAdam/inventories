export type Language = 'en' | 'ar'

export interface LanguageState {
  current: Language
  direction: 'ltr' | 'rtl'
  available: Language[]
}

export interface Translation {
  [key: string]: string | Translation
}

export interface Translations {
  en: Translation
  ar: Translation
}