"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var crypto = require("crypto");
var path = require("path");
var ALGO = 'aes-256-gcm';
var IV_LENGTH = 12;
function encryptBuffer(plain, key) {
    var iv = crypto.randomBytes(IV_LENGTH);
    var cipher = crypto.createCipheriv(ALGO, key, iv);
    var ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
    var tag = cipher.getAuthTag();
    var out = Buffer.concat([iv, tag, ciphertext]);
    return out.toString('base64');
}
function updateDotEnv(envPath, key, value) {
    var content = '';
    if (fs.existsSync(envPath))
        content = fs.readFileSync(envPath, 'utf8');
    var lines = content.split(/\r?\n/).filter(function () { return true; });
    var found = false;
    var newLines = lines.map(function (l) {
        if (l.trim().startsWith(key + '=')) {
            found = true;
            return "".concat(key, "=").concat(value);
        }
        return l;
    });
    if (!found)
        newLines.push("".concat(key, "=").concat(value));
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
}
function main() {
    var cwd = process.cwd();
    // default plaintext file locations (make an assumption)
    var candidates = [
        path.resolve(cwd, 'src', 'Db_Encript', 'plaintext.json'),
        path.resolve(cwd, 'plaintext.json'),
    ];
    var plainPath;
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var c = candidates_1[_i];
        if (fs.existsSync(c)) {
            plainPath = c;
            break;
        }
    }
    if (!plainPath) {
        console.error('plaintext.json not found in src/Db_Encript or project root. Create it with your secrets.');
        process.exit(2);
    }
    var keyHex = process.env.SECRETS_KEY;
    var key;
    if (!keyHex) {
        // generate a key and print it for the user to export
        key = crypto.randomBytes(32);
        var newHex = key.toString('hex');
        console.log('No SECRETS_KEY found. Generated a new key. Set SECRETS_KEY to the following (keep it secret):');
        console.log(newHex);
        console.log('You can export it in your shell or place it in .env as SECRETS_KEY=<hex>');
    }
    else {
        key = Buffer.from(keyHex, 'hex');
        if (key.length !== 32) {
            console.error('SECRETS_KEY must be 32 bytes (64 hex chars)');
            process.exit(2);
        }
    }
    var raw = JSON.parse(fs.readFileSync(plainPath, 'utf8'));
    var plainBuf = Buffer.from(JSON.stringify(raw), 'utf8');
    var sealed = encryptBuffer(plainBuf, key);
    // write encrypted-secrets.json next to the script
    var outPath = path.resolve(cwd, 'src', 'Db_Encript', 'encrypted-secrets.json');
    fs.writeFileSync(outPath, JSON.stringify({ data: sealed }, null, 2), 'utf8');
    console.log('Wrote encrypted secrets to', outPath);
    // If plaintext contains DATABASE_URL, also write an ENCRYPTED_DATABASE_URL entry into .env
    if (raw.DATABASE_URL) {
        var encryptedDb = encryptBuffer(Buffer.from(String(raw.DATABASE_URL), 'utf8'), key);
        var envPath = path.resolve(cwd, '.env');
        updateDotEnv(envPath, 'ENCRYPTED_DATABASE_URL', encryptedDb);
        console.log('Wrote ENCRYPTED_DATABASE_URL to', envPath);
    }
    else {
        console.log('No DATABASE_URL field found in plaintext.json; skipping .env update.');
    }
}
if (require.main === module)
    main();
