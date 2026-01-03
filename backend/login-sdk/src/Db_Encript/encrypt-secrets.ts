import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function encryptBuffer(plain: Buffer, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, ciphertext]);
  return out.toString('base64');
}

function updateDotEnv(envPath: string, key: string, value: string) {
  let content = '';
  if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');

  const lines = content.split(/\r?\n/).filter(() => true);
  let found = false;
  const newLines = lines.map((l) => {
    if (l.trim().startsWith(key + '=')) {
      found = true;
      return `${key}=${value}`;
    }
    return l;
  });
  if (!found) newLines.push(`${key}=${value}`);
  fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
}

function main() {
  const cwd = process.cwd();
  // default plaintext file locations (make an assumption)
  const candidates = [
    path.resolve(cwd, 'src', 'Db_Encript', 'plaintext.json'),
    path.resolve(cwd, 'plaintext.json'),
  ];

  let plainPath: string | undefined;
  for (const c of candidates) if (fs.existsSync(c)) { plainPath = c; break; }
  if (!plainPath) {
    console.error('plaintext.json not found in src/Db_Encript or project root. Create it with your secrets.');
    process.exit(2);
  }

  const keyHex = process.env.SECRETS_KEY;
  let key: Buffer;
  if (!keyHex) {
    // generate a key and print it for the user to export
    key = crypto.randomBytes(32);
    const newHex = key.toString('hex');
    console.log('No SECRETS_KEY found. Generated a new key. Set SECRETS_KEY to the following (keep it secret):');
    console.log(newHex);
    console.log('You can export it in your shell or place it in .env as SECRETS_KEY=<hex>');
  } else {
    key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) { console.error('SECRETS_KEY must be 32 bytes (64 hex chars)'); process.exit(2); }
  }

  const raw = JSON.parse(fs.readFileSync(plainPath, 'utf8')) as Record<string, any>;
  const plainBuf = Buffer.from(JSON.stringify(raw), 'utf8');
  const sealed = encryptBuffer(plainBuf, key);

  // write encrypted-secrets.json next to the script
  const outPath = path.resolve(cwd, 'src', 'Db_Encript', 'encrypted-secrets.json');
  fs.writeFileSync(outPath, JSON.stringify({ data: sealed }, null, 2), 'utf8');
  console.log('Wrote encrypted secrets to', outPath);

  // If plaintext contains DATABASE_URL, also write an ENCRYPTED_DATABASE_URL entry into .env
  if (raw.DATABASE_URL) {
    const encryptedDb = encryptBuffer(Buffer.from(String(raw.DATABASE_URL), 'utf8'), key);
    const envPath = path.resolve(cwd, '.env');
    updateDotEnv(envPath, 'ENCRYPTED_DATABASE_URL', encryptedDb);
    console.log('Wrote ENCRYPTED_DATABASE_URL to', envPath);
  } else {
    console.log('No DATABASE_URL field found in plaintext.json; skipping .env update.');
  }
}

if (require.main === module) main();