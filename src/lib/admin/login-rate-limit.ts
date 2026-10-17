import { createHmac } from 'node:crypto';
import { readJson, writeJson, StorageConflictError, storageConfigured } from '@/lib/content/data-store';

const WINDOW_MS = 15 * 60 * 1000;

async function increment(key: string, limit: number): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await readJson<{ count: number }>(key);
    if (current && (!Number.isSafeInteger(current.value.count) || current.value.count >= limit)) return false;
    try {
      await writeJson(key, { count: (current?.value.count ?? 0) + 1 }, current?.etag ?? null);
      return true;
    } catch (error) { if (!(error instanceof StorageConflictError)) throw error; }
  }
  return false;
}

export async function allowLoginAttempt(ip: string): Promise<boolean> {
  if (!storageConfigured() || !process.env.ADMIN_SESSION_SECRET) throw new Error('Login unavailable');
  const bucket = Math.floor(Date.now() / WINDOW_MS);
  const digest = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(ip).digest('hex');
  const globalKey = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update('global').digest('hex');
  const prefix = `cms-auth/${bucket}`;
  if (!(await increment(`${prefix}/${digest}.json`, 10))) return false;
  return increment(`${prefix}/${globalKey}.json`, 100);
}
