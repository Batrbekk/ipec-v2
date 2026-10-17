import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdminRequest } from '@/lib/admin/auth';
import { adminJson, adminError, readRequestJson, RequestBodyError } from '@/lib/admin/http';
import { mediaFields } from '@/lib/content/model';
import { IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, isUploadPath } from '@/lib/content/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await readRequestJson(request, 16 * 1024) as HandleUploadBody;
    if (!body || !['blob.generate-client-token', 'blob.upload-completed'].includes(body.type)) throw new RequestBodyError('Некорректная загрузка.');
    // Completed-upload callbacks are signed by Blob, not by the browser session.
    // The SDK checks that signature; only token issuance uses cookie + Origin.
    if (body.type === 'blob.generate-client-token') await requireAdminRequest(request);
    if (!process.env.BLOB_READ_WRITE_TOKEN) return adminJson({ error: 'Загрузка файлов ещё не настроена.' }, 503);
    const result = await handleUpload({
      request, body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}');
        const field = mediaFields.find(field => field.key === payload.slot);
        if (!field || !isUploadPath(pathname, field.key)) throw new RequestBodyError('Недопустимый файл.');
        return {
          allowedContentTypes: field.kind === 'video' ? VIDEO_TYPES : IMAGE_TYPES,
          maximumSizeInBytes: field.kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
          validUntil: Date.now() + 30 * 60 * 1000,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return adminJson(result);
  } catch (error) { return adminError(error); }
}
