import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  readJson,
  writeJson,
  storageConfigured,
  StorageConflictError,
  StorageUnavailableError,
} from '../src/lib/content/data-store';
import { allowLoginAttempt } from '../src/lib/admin/login-rate-limit';

test('durable local storage and login limits', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'ipec-cms-store-test-'));
  const keys = ['CMS_LOCAL_STORE', 'VERCEL', 'BLOB_READ_WRITE_TOKEN', 'ADMIN_SESSION_SECRET'] as const;
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  delete process.env.VERCEL;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  process.env.CMS_LOCAL_STORE = directory;
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString('base64');
  t.after(async () => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
    await rm(directory, { recursive: true, force: true });
  });

  await t.test('first create persists data and an ETag; a second first-create conflicts', async () => {
    assert.equal(storageConfigured(), true);
    assert.equal(await readJson('cms/first.json'), null);
    const initial = await writeJson('cms/first.json', { text: 'Original' }, null);
    assert.ok(initial.etag);
    assert.deepEqual(await readJson('cms/first.json'), initial);
    await assert.rejects(writeJson('cms/first.json', { text: 'Unexpected overwrite' }, null), StorageConflictError);
    assert.deepEqual((await readJson('cms/first.json'))?.value, { text: 'Original' });
  });

  await t.test('a current ETag saves successfully and a stale ETag cannot overwrite it', async () => {
    const first = await writeJson('cms/edit.json', { revision: 1 }, null);
    const second = await writeJson('cms/edit.json', { revision: 2 }, first.etag);
    assert.notEqual(second.etag, first.etag);
    await assert.rejects(writeJson('cms/edit.json', { revision: 3 }, first.etag), StorageConflictError);
    assert.deepEqual(await readJson('cms/edit.json'), second);
  });

  await t.test('concurrent creates and updates allow exactly one writer with the expected ETag', async () => {
    const creates = await Promise.allSettled([
      writeJson('cms/concurrent-create.json', { writer: 'one' }, null),
      writeJson('cms/concurrent-create.json', { writer: 'two' }, null),
    ]);
    assert.equal(creates.filter(result => result.status === 'fulfilled').length, 1);
    for (const result of creates) if (result.status === 'rejected') assert.ok(result.reason instanceof StorageConflictError);
    const initial = await writeJson('cms/concurrent-edit.json', { revision: 1 }, null);
    const edits = await Promise.allSettled([
      writeJson('cms/concurrent-edit.json', { revision: 2 }, initial.etag),
      writeJson('cms/concurrent-edit.json', { revision: 3 }, initial.etag),
    ]);
    const successful = edits.filter(result => result.status === 'fulfilled');
    assert.equal(successful.length, 1);
    for (const result of edits) if (result.status === 'rejected') assert.ok(result.reason instanceof StorageConflictError);
    if (successful[0].status === 'fulfilled') assert.deepEqual(await readJson('cms/concurrent-edit.json'), successful[0].value);
    assert.ok((await readdir(path.join(directory, 'cms'))).every(filename => !filename.endsWith('.lock')));
  });

  await t.test('local storage rejects path traversal outside its explicit directory', async () => {
    await assert.rejects(writeJson('../outside.json', {}, null), /Invalid storage key/);
    await assert.rejects(readJson('cms/../../outside.json'), /Invalid storage key/);
  });

  await t.test('the durable limiter permits ten attempts per IP per window and stores no raw IP', async () => {
    const fixedNow = 1_800_000_000_000;
    t.mock.method(Date, 'now', () => fixedNow);
    const ip = '203.0.113.42';
    for (let attempt = 0; attempt < 10; attempt++) assert.equal(await allowLoginAttempt(ip), true);
    assert.equal(await allowLoginAttempt(ip), false);
    assert.equal(await allowLoginAttempt(ip), false);
    assert.equal(await allowLoginAttempt('203.0.113.43'), true);
    const bucket = Math.floor(fixedNow / (15 * 60 * 1000));
    const filenames = await readdir(path.join(directory, 'cms-auth', String(bucket)));
    assert.ok(filenames.every(filename => /^[a-f0-9]{64}\.json$/.test(filename)));
    t.mock.restoreAll();
    t.mock.method(Date, 'now', () => fixedNow + 15 * 60 * 1000);
    assert.equal(await allowLoginAttempt(ip), true);
    t.mock.restoreAll();
  });

  await t.test('Vercel ignores CMS_LOCAL_STORE and missing Blob configuration fails closed', async () => {
    process.env.VERCEL = '1';
    try {
      assert.equal(storageConfigured(), false);
      await assert.rejects(readJson('cms/first.json'), StorageUnavailableError);
      await assert.rejects(writeJson('cms/not-local.json', {}, null), StorageUnavailableError);
      await assert.rejects(allowLoginAttempt('203.0.113.44'), /Login unavailable/);
    } finally {
      delete process.env.VERCEL;
    }
    assert.equal(storageConfigured(), true);
    assert.equal(await readJson('cms/not-local.json'), null);
  });
});
