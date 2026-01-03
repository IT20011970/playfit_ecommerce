# Secrets encryption helper

This folder contains helper scripts to encrypt/decrypt application secrets.

Usage

1. Create a `plain-secrets.json` at the repository root with your secrets (DO NOT COMMIT):

```json
{
  "DATABASE_URL": "postgresql://...",
  "JWT_SECRET": "your_jwt_secret"
}
```

2. Generate a 32-byte (256-bit) key and set it in your shell as `SECRETS_KEY` (64 hex chars):

```powershell
$env:SECRETS_KEY = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Run the encrypt script (requires `ts-node`):

```powershell
cd backend/login-sdk
npm run encrypt:secrets
```

4. Remove `plain-secrets.json` after encryption and keep `src/encrypted-secrets.json` in the repo if you like.

Runtime

When the app starts it will use `SECRETS_KEY` from the environment to decrypt `src/encrypted-secrets.json` and set `process.env.DATABASE_URL` if present.

Security notes

- Never commit `plain-secrets.json` or `SECRETS_KEY`.
- Use a secrets manager to store `SECRETS_KEY` in production.
- Consider using a managed KMS for stronger key management.
