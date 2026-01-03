import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function readDotenvKey(key: string): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
  ];
  for (const c of candidates) {
    try {
      if (!fs.existsSync(c)) continue;
      const txt = fs.readFileSync(c, 'utf8');
      for (const line of txt.split(/\r?\n/)) {
        const m = line.match(new RegExp('^\\s*' + key + '\\s*=\\s*(.+)\\s*$'));
        if (m) return m[1].trim();
      }
    } catch (e) {
      // ignore
    }
  }
  return undefined;
}

function decodeAndDescribe(b64: string) {
  const buf = Buffer.from(b64, 'base64');
  console.log('  total bytes:', buf.length);
  if (buf.length < IV_LENGTH + 16) {
    console.log('  payload too short for iv+tag');
    return null;
  }
  const iv = buf.slice(0, IV_LENGTH);
  const tag = buf.slice(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = buf.slice(IV_LENGTH + 16);
  console.log('  iv hex:', iv.toString('hex'));
  console.log('  tag hex:', tag.toString('hex'));
  console.log('  ciphertext bytes:', ciphertext.length);
  console.log('  ciphertext head (hex):', ciphertext.slice(0, 32).toString('hex'));
  return { iv, tag, ciphertext };
}

function tryDecrypt(b64: string, keyHex: string) {
  try {
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
      console.error('SECRETS_KEY length != 32 bytes (hex length:', keyHex.length, ')');
      return;
    }
    const buf = Buffer.from(b64, 'base64');
    const iv = buf.slice(0, IV_LENGTH);
    const tag = buf.slice(IV_LENGTH, IV_LENGTH + 16);
    const ciphertext = buf.slice(IV_LENGTH + 16);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    console.log('DECRYPT OK — plaintext head:', plain.toString('utf8').slice(0, 400));
  } catch (e: any) {
    console.error('DECRYPT FAILED:', e && e.message ? e.message : String(e));
  }
}

function main() {
  console.log('Debug decrypt — inspecting ENCRYPTED_DATABASE_URL and encrypted-secrets.json');

  const envEnc = process.env.ENCRYPTED_DATABASE_URL || (() => {
    // try read from .env
    const v = readDotenvKey('ENCRYPTED_DATABASE_URL');
    if (v) return v;
    return undefined;
  })();

  const encFilePath = path.resolve(__dirname, 'encrypted-secrets.json');
  let fileEnc: string | undefined;
  if (fs.existsSync(encFilePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(encFilePath, 'utf8'));
      if (raw && raw.data) fileEnc = raw.data;
    } catch (e) {
      console.error('Failed to read', encFilePath, e);
    }
  }

  if (!envEnc && !fileEnc) {
    console.log('No encrypted payload found in env or encrypted-secrets.json');
    return;
  }

  if (envEnc) {
    console.log('\nFound ENCRYPTED_DATABASE_URL (from env/.env):');
    const parts = decodeAndDescribe(envEnc);
  }

  if (fileEnc) {
    console.log('\nFound encrypted-secrets.json -> data:');
    decodeAndDescribe(fileEnc);
  }

  const keyFromEnv = process.env.SECRETS_KEY || readDotenvKey('SECRETS_KEY');
  if (!keyFromEnv) {
    console.error('\nNo SECRETS_KEY found in process.env or .env — cannot decrypt.');
    return;
  }
  console.log('\nUsing SECRETS_KEY from env/.env (hex length', keyFromEnv.length, ')');

  if (envEnc) {
    console.log('\nAttempt decrypt ENCRYPTED_DATABASE_URL:');
    tryDecrypt(envEnc, keyFromEnv);
  }
  if (fileEnc) {
    console.log('\nAttempt decrypt encrypted-secrets.json:');
    tryDecrypt(fileEnc, keyFromEnv);
  }
}

if (require.main === module) main();
