import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultContent } from '../src/lib/content/defaults';
import { mediaFields, type MessageTree, type SiteContent } from '../src/lib/content/model';
import {
  ContentValidationError,
  IMAGE_TYPES,
  VIDEO_TYPES,
  isMediaUrl,
  isUploadPath,
  validateContent,
} from '../src/lib/content/validation';

const locales = ['ru', 'kk', 'en'] as const;
const blobHost = 'teststore.public.blob.vercel-storage.com';
const fileId = '550e8400-e29b-41d4-a716-446655440000';

function carousel(content: SiteContent, locale: (typeof locales)[number]): MessageTree {
  const services = content.messages[locale].services as MessageTree;
  return (services.carousel as MessageTree).assetManagement as MessageTree;
}

function emailMessages(content: SiteContent, locale: (typeof locales)[number]): MessageTree {
  const contact = content.messages[locale].contact as MessageTree;
  return (contact.form as MessageTree).messages as MessageTree;
}

function rejectsChange(change: (value: SiteContent) => void, field?: string) {
  const content = createDefaultContent();
  change(content);
  assert.throws(() => validateContent(content, blobHost), (error: unknown) => {
    assert.ok(error instanceof ContentValidationError);
    if (field) assert.ok(error.fields.some(item => item.includes(field)), error.fields.join(', '));
    return true;
  });
}

test('default content and independently edited text in all three languages validate', () => {
  const source = createDefaultContent();
  for (const locale of locales) {
    (source.messages[locale].hero as MessageTree).title = `Edited title ${locale}`;
  }
  const validated = validateContent(source, blobHost);
  assert.deepEqual(validated, source);
  assert.notEqual(validated, source);
  (validated.messages.ru.hero as MessageTree).title = 'Another edit';
  assert.equal((source.messages.ru.hero as MessageTree).title, 'Edited title ru');
});

test('each language and every known nested field is required; unknown fields are rejected', () => {
  for (const locale of locales) {
    rejectsChange(content => { delete (content.messages as Partial<SiteContent['messages']>)[locale]; }, `messages.${locale}`);
    rejectsChange(content => { delete (content.messages[locale].hero as MessageTree).title; }, `messages.${locale}.hero.title`);
    rejectsChange(content => { (content.messages[locale].hero as MessageTree).unexpected = 'Unknown'; }, 'unexpected');
  }
  rejectsChange(content => { (content as unknown as Record<string, unknown>).unexpected = true; }, 'unexpected');
  rejectsChange(content => { (content.messages as Record<string, MessageTree>).de = {}; }, 'messages.de');
  rejectsChange(content => { (content.media as Record<string, string>).unknownImage = '/image/logo.svg'; }, 'media.unknownImage');
  rejectsChange(content => { (content.settings as unknown as Record<string, unknown>).password = 'must not be content'; }, 'settings.password');
  rejectsChange(content => {
    Object.defineProperty(content.messages.ru, '__proto__', { value: {}, enumerable: true });
  }, '__proto__');
});

test('service lists accept 1–30 strings in every language and reject invalid entries', () => {
  for (const locale of locales) {
    for (const count of [1, 30]) {
      const content = createDefaultContent();
      carousel(content, locale).services = Array.from({ length: count }, (_, index) => `Service ${index}`);
      assert.doesNotThrow(() => validateContent(content, blobHost));
    }
    for (const count of [0, 31]) {
      rejectsChange(content => { carousel(content, locale).services = Array(count).fill('Service'); }, `messages.${locale}.services`);
    }
    rejectsChange(content => { carousel(content, locale).services = ['']; }, `messages.${locale}.services`);
    rejectsChange(content => { carousel(content, locale).services = ['   ']; }, `messages.${locale}.services`);
    rejectsChange(content => { carousel(content, locale).services = [42] as unknown as string[]; }, `messages.${locale}.services`);
  }
});

test('ICU syntax and required placeholders are preserved without accepting rich HTML', () => {
  for (const locale of locales) {
    const valid = createDefaultContent();
    emailMessages(valid, locale).emailSubject = '{company}: новое сообщение от {name}';
    assert.doesNotThrow(() => validateContent(valid, blobHost));
    for (const value of [
      'Only {name}',
      '{name} {company} {extra}',
      'Broken {name',
      '<b>{name}</b> {company}',
      '{name, number} {company}',
      '{name, date} {company}',
      '{name, select, other {Someone}} {company}',
    ]) {
      rejectsChange(content => { emailMessages(content, locale).emailSubject = value; }, 'emailSubject');
    }
    rejectsChange(content => { (content.messages[locale].hero as MessageTree).title = 'Unprovided {variable}'; }, 'hero.title');
  }
});

test('blank or excessively long text, invalid metadata and unsafe contact URLs are rejected', () => {
  rejectsChange(content => { (content.messages.ru.hero as MessageTree).title = ''; }, 'hero.title');
  rejectsChange(content => { (content.messages.ru.hero as MessageTree).title = 'x'.repeat(10001); }, 'hero.title');
  rejectsChange(content => { content.schemaVersion = 2 as 1; }, 'Версия документа');
  rejectsChange(content => { content.updatedAt = 'not a date'; }, 'Дата обновления');
  for (const mapUrl of ['javascript:alert(1)', 'http://maps.example.com', 'https://user:password@maps.example.com', 'https://maps.example.com:444']) {
    rejectsChange(content => { content.settings.mapUrl = mapUrl; }, 'Ссылка на карту');
  }
  rejectsChange(content => { content.settings.phoneHref = 'javascript:alert(1)'; }, 'Ссылка телефона');
  rejectsChange(content => { content.settings.email = 'person@example.com\r\nBcc: other@example.com'; }, 'Email');
});

test('media slots accept only their own defaults and correctly typed uploads in the chosen store', () => {
  for (const field of mediaFields) {
    assert.equal(isMediaUrl(field.defaultSrc, field.key, blobHost), true);
    const extension = field.kind === 'video' ? 'mp4' : 'png';
    const path = `media/${field.key}/${fileId}.${extension}`;
    assert.equal(isUploadPath(path, field.key), true);
    assert.equal(isMediaUrl(`https://${blobHost}/${path}`, field.key, blobHost), true);
    assert.equal(isUploadPath(`media/${field.key}/${fileId}.${field.kind === 'video' ? 'png' : 'mp4'}`, field.key), false);
  }
  assert.equal(isUploadPath(`media/unknown/${fileId}.png`, 'unknown' as typeof mediaFields[number]['key']), false);
  assert.equal(isUploadPath(`media/aboutImage/${fileId}.svg`, 'aboutImage'), false);
  assert.equal(isUploadPath(`media/aboutImage/${fileId}.html`, 'aboutImage'), false);
  assert.equal(isUploadPath(`media/headerLogo/${fileId}.png`, 'aboutImage'), false);
  assert.equal(isUploadPath('media/aboutImage/../../site.json', 'aboutImage'), false);
  assert.ok(IMAGE_TYPES.every(type => type.startsWith('image/')));
  assert.ok(!IMAGE_TYPES.includes('image/svg+xml'));
  assert.deepEqual(VIDEO_TYPES, ['video/mp4', 'video/webm']);
});

test('media URL validation rejects external hosts, credentials, query strings and encoded paths', () => {
  const pathname = `media/aboutImage/${fileId}.png`;
  for (const url of [
    `http://${blobHost}/${pathname}`,
    `https://evil.example/${pathname}`,
    `https://otherstore.public.blob.vercel-storage.com/${pathname}`,
    `https://user:pass@${blobHost}/${pathname}`,
    `https://${blobHost}:444/${pathname}`,
    `https://${blobHost}/${pathname}?download=1`,
    `https://${blobHost}/${pathname}#fragment`,
    `https://${blobHost}/media/aboutImage/%2e%2e/${fileId}.png`,
    'data:image/png;base64,AA==',
    'javascript:alert(1)',
    '//evil.example/image.png',
    '/image/services/1.png',
  ]) {
    assert.equal(isMediaUrl(url, 'aboutImage', blobHost), false, url);
    rejectsChange(content => { content.media.aboutImage = url; }, 'media.aboutImage');
  }
});
