import { NextResponse } from 'next/server';
import { AdminAuthError } from './auth';
import { ContentValidationError } from '@/lib/content/validation';
import { StorageConflictError } from '@/lib/content/data-store';

export class RequestBodyError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function readRequestJson(request: Request, maximumBytes: number): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RequestBodyError('Ожидается JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError('Пустой запрос.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    total += result.value.byteLength;
    if (total > maximumBytes) { await reader.cancel(); throw new RequestBodyError('Запрос слишком большой.', 413); }
    chunks.push(result.value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestBodyError('Некорректный JSON.'); }
}

export function adminJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export function adminError(error: unknown) {
  if (error instanceof AdminAuthError || error instanceof RequestBodyError) return adminJson({ error: error.message }, error.status);
  if (error instanceof ContentValidationError) return adminJson({ error: error.message, fields: error.fields }, 400);
  if (error instanceof StorageConflictError) return adminJson({ error: 'Сайт уже изменён в другой вкладке. Сохраните копию своих правок и загрузите актуальную версию.' }, 409);
  console.error('CMS: administrative operation failed.');
  return adminJson({ error: 'Не удалось связаться с хранилищем. Попробуйте ещё раз; ваши правки остались в редакторе.' }, 503);
}
