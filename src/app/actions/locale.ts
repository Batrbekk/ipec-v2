'use server';

import { redirect } from 'next/navigation';
import { setUserLocale } from '@/i18n/utils';
import { type Locale } from '@/i18n/config';

export async function changeLocale(locale: Locale) {
  await setUserLocale(locale);
  redirect('/');
}
