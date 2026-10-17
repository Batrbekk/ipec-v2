import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, open, unlink } from 'node:fs/promises';
import path from 'node:path';

export class StorageConflictError extends Error {}
export class StorageUnavailableError extends Error {}
export type StoredJson<T> = { value: T; etag: string };

function localDirectory(): string | undefined {
  return !process.env.VERCEL ? process.env.CMS_LOCAL_STORE : undefined;
}

export function storageConfigured(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || localDirectory());
}

export function blobHostname(): string | undefined {
  const id = process.env.BLOB_READ_WRITE_TOKEN?.split('_')[3];
  return id && /^[a-z0-9]+$/i.test(id) ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : undefined;
}

function localPath(key: string): string {
  if (!/^[a-zA-Z0-9/_-]+\.json$/.test(key) || key.includes('..')) throw new Error('Invalid storage key');
  return path.join(localDirectory()!, key);
}

export async function readJson<T>(key: string): Promise<StoredJson<T> | null> {
  if (localDirectory()) {
    try {
      const bytes = await readFile(localPath(key));
      if (bytes.byteLength > 1024 * 1024) throw new Error('Stored document is too large');
      return { value: JSON.parse(bytes.toString()), etag: createHash('sha256').update(bytes).digest('hex') };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new StorageUnavailableError('Хранилище не подключено.');
  const result = await get(key, { access: 'public', useCache: false, abortSignal: AbortSignal.timeout(12000) });
  if (!result) return null;
  if (result.statusCode !== 200 || result.blob.size > 1024 * 1024) throw new Error('Invalid stored document');
  return { value: await new Response(result.stream).json(), etag: result.blob.etag };
}

export async function writeJson<T>(key: string, value: T, expectedEtag: string | null): Promise<StoredJson<T>> {
  const bytes = JSON.stringify(value);
  if (localDirectory()) {
    const filename = localPath(key);
    await mkdir(path.dirname(filename), { recursive: true });
    let lock;
    try { lock = await open(filename + '.lock', 'wx'); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StorageConflictError();
      throw error;
    }
    try {
      const current = await readJson(key);
      if ((current?.etag ?? null) !== expectedEtag) throw new StorageConflictError();
      const temporary = filename + '.' + randomUUID();
      await writeFile(temporary, bytes, { mode: 0o600 });
      await rename(temporary, filename);
      return { value, etag: createHash('sha256').update(bytes).digest('hex') };
    } finally { await lock.close(); await unlink(filename + '.lock'); }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new StorageUnavailableError('Хранилище не подключено.');
  try {
    const result = await put(key, bytes, {
      access: 'public', addRandomSuffix: false, contentType: 'application/json',
      cacheControlMaxAge: 60, allowOverwrite: expectedEtag !== null,
      ...(expectedEtag ? { ifMatch: expectedEtag } : {}),
      abortSignal: AbortSignal.timeout(12000),
    });
    return { value, etag: result.etag };
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || (error instanceof Error && /already exists|precondition/i.test(error.message))) throw new StorageConflictError();
    throw error;
  }
}
