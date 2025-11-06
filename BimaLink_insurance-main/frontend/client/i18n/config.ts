import enTranslations from './en.json';
import frTranslations from './fr.json';

export type Language = 'en' | 'fr';

export const translations: Record<Language, typeof enTranslations> = {
  en: enTranslations,
  fr: frTranslations,
};

export const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
];

export const defaultLanguage: Language = 'en';

// Type-safe translation key helper
export type TranslationKey = keyof typeof enTranslations;
