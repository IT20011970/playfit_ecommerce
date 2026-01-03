
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function decryptBuffer(b64: string, key: Buffer): Buffer {
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.slice(0, IV_LENGTH);
  const tag = buf.slice(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = buf.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain;
}

function loadDecrypted(): Record<string, any> {
  const keyHex = process.env.SECRETS_KEY;
  let keyHexResolved = keyHex;
  // If SECRETS_KEY not in process.env, try to read .env in common locations (local dev convenience)
  if (!keyHexResolved) {
    const dotenvCandidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '..', '..', '.env'),
      path.resolve(__dirname, '..', '.env'),
    ];
    for (const d of dotenvCandidates) {
      try {
        if (!fs.existsSync(d)) continue;
        const txt = fs.readFileSync(d, 'utf8');
        for (const line of txt.split(/\r?\n/)) {
          const m = line.match(/^\s*SECRETS_KEY\s*=\s*(.+)\s*$/);
          if (m) { keyHexResolved = m[1].trim(); break; }
        }
        if (keyHexResolved) break;
      } catch (e) {
        // ignore read errors and continue
      }
    }
  }
  const key = keyHexResolved ? Buffer.from(keyHexResolved, 'hex') : undefined;
  if (key && key.length !== 32) throw new Error('SECRETS_KEY must be 32 bytes (64 hex chars)');

  // If an encrypted database URL is provided directly in env, decrypt and return it (no file required)
  if (process.env.ENCRYPTED_DATABASE_URL) {
    if (!key) {
      throw new Error('ENCRYPTED_DATABASE_URL found in env but SECRETS_KEY is not set.\n' +
        'Tip: set SECRETS_KEY in your environment or add SECRETS_KEY=<hex> to your .env (local only).');
    }
    try {
      const dbBuf = decryptBuffer(process.env.ENCRYPTED_DATABASE_URL, key);
      return {
        DATABASE_URL: dbBuf.toString('utf8'),
        JWT_SECRET: process.env.JWT_SECRET,
      } as Record<string, any>;
    } catch (e) {
      throw new Error('Failed to decrypt ENCRYPTED_DATABASE_URL: ' + String(e));
    }
  }

  // Try several locations where the encrypted file might live depending on run mode
  const candidates = [
    // when running compiled from dist: dist/Db_Encript/../encrypted-secrets.json -> dist/encrypted-secrets.json
    path.resolve(__dirname, '../encrypted-secrets.json'),
    // when running from source (ts-node / dev): src/Db_Encript/encrypted-secrets.json
    path.resolve(process.cwd(), 'src', 'Db_Encript', 'encrypted-secrets.json'),
    // backup locations
    path.resolve(process.cwd(), 'src', 'encrypted-secrets.json'),
    path.resolve(process.cwd(), 'encrypted-secrets.json'),
  ];

  let encPath: string | undefined;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      encPath = c;
      break;
    }
  }
  if (!encPath) {
    // No encrypted file found. Fall back to environment variables if available.
    if (process.env.DATABASE_URL) {
      // Use existing env vars (useful during local dev)
      // Return minimal structure for compatibility
      return {
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
      } as Record<string, any>;
    }
    throw new Error('encrypted-secrets.json not found. Checked locations:\n' + candidates.join('\n'));
  }

  // Encrypted file exists at encPath. We require a key to decrypt it.
  if (!key) {
    throw new Error('Found encrypted-secrets.json at ' + encPath + " but SECRETS_KEY env var is not set. Set SECRETS_KEY to decrypt secrets or remove encrypted-secrets.json to use environment variables.");
  }

  const raw = JSON.parse(fs.readFileSync(encPath, 'utf8'));
  if (!raw.data) throw new Error('encrypted-secrets.json missing data field');
  const plainBuf = decryptBuffer(raw.data, key);
  return JSON.parse(plainBuf.toString('utf8'));
}

export const decryptedSecrets = loadDecrypted();
