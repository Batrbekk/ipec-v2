import { hasAdminSession, isAdminConfigured } from '@/lib/admin/auth';
import { storageConfigured } from '@/lib/content/data-store';
import { readContent } from '@/lib/content/store';
import AdminEditor from '@/components/admin/AdminEditor';
import AdminLogin from '@/components/admin/AdminLogin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await hasAdminSession())) return <AdminLogin configured={isAdminConfigured() && storageConfigured()} />;
  try {
    const { content, etag, storageConfigured: configured } = await readContent();
    return <AdminEditor initialContent={content} initialEtag={etag} storageConfigured={configured} />;
  } catch {
    return <main style={{ padding: '4rem', maxWidth: 720, margin: 'auto' }}><h1>Хранилище временно недоступно</h1><p>Обновите страницу через минуту. Опубликованные данные не изменены.</p><a href="/admin">Попробовать снова</a></main>;
  }
}
