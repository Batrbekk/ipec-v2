import 'server-only';
import { cache } from 'react';
import { randomUUID } from 'node:crypto';
import { head } from '@vercel/blob';
import { createDefaultContent } from './defaults';
import { mediaFields, type SiteContent } from './model';
import { blobHostname, readJson, writeJson, storageConfigured, StorageConflictError } from './data-store';
import { validateContent, ContentValidationError, IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from './validation';

const contentPath = () => `${process.env.VERCEL_ENV === 'preview' ? 'cms-preview' : 'cms'}/site.json`;

export async function readContent() {
  if (!storageConfigured()) return { content: createDefaultContent(), etag: null, storageConfigured: false };
  const stored = await readJson<SiteContent>(contentPath());
  return {
    content: stored ? validateContent(stored.value, blobHostname()) : createDefaultContent(),
    etag: stored?.etag ?? null,
    storageConfigured: true,
  };
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try { return (await readContent()).content; }
  catch {
    // The source content keeps the public website available during a storage outage.
    // Admin reads fail visibly instead of permitting a save against an unknown version.
    console.error('CMS: published content unavailable; using source content.');
    return createDefaultContent();
  }
});

export async function saveContent(input: unknown, etag: string | null) {
  const content = validateContent(input, blobHostname());
  const current = await readContent();
  if (!current.storageConfigured) throw new Error('Хранилище не подключено.');
  if (current.etag !== etag) throw new StorageConflictError();
  // Verify that new URLs refer to actual, appropriately sized uploads in this store.
  await Promise.all(mediaFields.map(async field => {
    const url = content.media[field.key];
    if (url === field.defaultSrc || url === current.content.media[field.key]) return;
    if (!blobHostname()) throw new ContentValidationError([`media.${field.key}`]);
    const blob = await head(url);
    const video = field.kind === 'video';
    if (!(video ? VIDEO_TYPES : IMAGE_TYPES).includes(blob.contentType) || blob.size > (video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
      throw new ContentValidationError([`media.${field.key}`]);
    }
  }));
  const published = { ...content, revision: randomUUID(), updatedAt: new Date().toISOString() };
  const prefix = process.env.VERCEL_ENV === 'preview' ? 'cms-preview' : 'cms';
  await writeJson(`${prefix}/history/${Date.now()}-${randomUUID()}.json`, current.content, null);
  const result = await writeJson(contentPath(), published, etag);
  return { content: result.value, etag: result.etag, storageConfigured: true };
}
