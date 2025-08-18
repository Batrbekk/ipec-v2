export const locales = ['ru', 'kk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export const localeNames: Record<Locale, string> = {
  ru: 'RU',
  kk: 'KZ',
  en: 'EN'
};
