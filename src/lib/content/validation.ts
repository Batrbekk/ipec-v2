import { parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { createDefaultContent } from './defaults';
import { mediaFields, type MediaKey, type SiteContent } from './model';

export const MAX_CONTENT_BYTES = 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

export class ContentValidationError extends Error {
  constructor(public fields: string[]) {
    super('Проверьте заполнение полей: ' + fields.slice(0, 4).join(', '));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function variables(elements: MessageFormatElement[]): string[] {
  const names = new Set<string>();
  for (const element of elements) {
    // CMS copy supports plain text and the existing string substitutions only.
    // Number/date/select formats can break rendering for arbitrary form input.
    if (element.type !== 0 && element.type !== 1) throw new Error('Unsupported text format');
    if (element.type === 1) names.add(element.value);
  }
  return [...names].sort();
}

function validateMessages(value: unknown, defaults: unknown, path: string, errors: string[]): void {
  if (typeof defaults === 'string') {
    if (typeof value !== 'string' || !value.trim() || value.length > 10000) {
      errors.push(path); return;
    }
    try {
      const actual = variables(parse(value));
      const expected = variables(parse(defaults));
      if (actual.join('|') !== expected.join('|')) errors.push(path + ' (подстановки)');
    } catch { errors.push(path + ' (формат текста)'); }
  } else if (Array.isArray(defaults)) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 30) {
      errors.push(path); return;
    }
    value.forEach((entry, index) => validateMessages(entry, defaults[0], `${path}.${index}`, errors));
  } else if (isRecord(defaults)) {
    if (!isRecord(value)) { errors.push(path); return; }
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(defaults, key)) errors.push(`${path}.${key}`);
    }
    for (const [key, entry] of Object.entries(defaults)) {
      validateMessages(value[key], entry, `${path}.${key}`, errors);
    }
  }
}

export function isMediaUrl(value: string, key: MediaKey, hostname?: string): boolean {
  const field = mediaFields.find(field => field.key === key)!;
  if (value === field.defaultSrc) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) return false;
    if (hostname ? url.hostname !== hostname : !/^[a-z0-9]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname)) return false;
    return isUploadPath(url.pathname.slice(1), key);
  } catch { return false; }
}

export function isUploadPath(pathname: string, key: MediaKey): boolean {
  const field = mediaFields.find(field => field.key === key);
  if (!field) return false;
  const extensions = field.kind === 'video' ? 'mp4|webm' : 'jpg|jpeg|png|webp|avif|gif|ico';
  return new RegExp(`^media/${key}/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\.(${extensions})$`).test(pathname);
}

export function validateContent(input: unknown, hostname?: string): SiteContent {
  const errors: string[] = [];
  const defaults = createDefaultContent();
  if (!isRecord(input)) throw new ContentValidationError(['Документ']);
  for (const key of Object.keys(input)) {
    if (!Object.hasOwn(defaults, key)) errors.push(key);
  }
  if (input.schemaVersion !== 1) errors.push('Версия документа');
  if (typeof input.revision !== 'string' || input.revision.length > 100) errors.push('Версия изменений');
  if (input.updatedAt !== null && (typeof input.updatedAt !== 'string' || !Number.isFinite(Date.parse(input.updatedAt)))) errors.push('Дата обновления');
  validateMessages(input.messages, defaults.messages, 'messages', errors);
  if (!isRecord(input.media)) errors.push('Медиа');
  else {
    for (const key of Object.keys(input.media)) if (!Object.hasOwn(defaults.media, key)) errors.push(`media.${key}`);
    for (const { key } of mediaFields) {
      const value = input.media[key];
      if (typeof value !== 'string' || value.length > 2048 || !isMediaUrl(value, key, hostname)) errors.push(`media.${key}`);
    }
  }
  const settings = input.settings;
  if (!isRecord(settings)) errors.push('Контакты');
  else {
    for (const key of Object.keys(settings)) if (!Object.hasOwn(defaults.settings, key)) errors.push(`settings.${key}`);
    if (typeof settings.phoneDisplay !== 'string' || !settings.phoneDisplay.trim() || settings.phoneDisplay.length > 100) errors.push('Телефон');
    if (typeof settings.phoneHref !== 'string' || !/^tel:\+?[0-9 ()-]{5,30}$/.test(settings.phoneHref)) errors.push('Ссылка телефона');
    if (typeof settings.email !== 'string' || settings.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(settings.email)) errors.push('Email');
    try {
      const url = new URL(String(settings.mapUrl));
      if (url.protocol !== 'https:' || url.username || url.password || url.port || String(settings.mapUrl).length > 2048) errors.push('Ссылка на карту');
    } catch { errors.push('Ссылка на карту'); }
  }
  if (errors.length) throw new ContentValidationError(errors);
  return structuredClone(input) as SiteContent;
}
