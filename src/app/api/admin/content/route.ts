import { hasAdminSession, requireAdminRequest } from '@/lib/admin/auth';
import { adminJson, adminError, readRequestJson, RequestBodyError } from '@/lib/admin/http';
import { readContent, saveContent } from '@/lib/content/store';
import { MAX_CONTENT_BYTES } from '@/lib/content/validation';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await hasAdminSession())) return adminJson({ error: 'Войдите в админку.' }, 401);
  try { return adminJson(await readContent()); }
  catch (error) { return adminError(error); }
}

export async function PUT(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await readRequestJson(request, MAX_CONTENT_BYTES);
    if (!body || typeof body !== 'object' || !('content' in body) || !('etag' in body) || (body.etag !== null && (typeof body.etag !== 'string' || body.etag.length > 256))) {
      throw new RequestBodyError('Не передана версия документа.');
    }
    const result = await saveContent(body.content, body.etag as string | null);
    revalidatePath('/', 'layout');
    return adminJson(result);
  } catch (error) { return adminError(error); }
}
