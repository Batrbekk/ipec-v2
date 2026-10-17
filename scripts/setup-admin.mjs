import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const directory = path.resolve(process.argv[2] || '.admin-private');
if (existsSync(path.join(directory, 'credentials.json'))) {
  throw new Error('Credentials already exist. Existing access was not changed.');
}
const password = randomBytes(24).toString('base64url');
const salt = randomBytes(32).toString('hex');
const key = scryptSync(password, Buffer.from(salt, 'hex'), 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex');
const credentials = {
  password,
  ADMIN_PASSWORD_HASH: `scrypt:${salt}:${key}`,
  ADMIN_SESSION_SECRET: randomBytes(32).toString('base64'),
  ADMIN_ORIGIN: 'https://www.ipec-energy.com',
};
mkdirSync(directory, { recursive: true, mode: 0o700 });
writeFileSync(path.join(directory, 'credentials.json'), JSON.stringify(credentials, null, 2), { mode: 0o600 });
writeFileSync(path.join(directory, 'access.txt'), `Админка IPEC Energy Kazakhstan\nhttps://www.ipec-energy.com/admin\n\nПароль: ${password}\n\nЛогин не требуется. Храните пароль в менеджере паролей.\n`, { mode: 0o600 });
console.log(`Private access files saved in ${directory}. No secrets were printed.`);
