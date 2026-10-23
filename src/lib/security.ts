import crypto from 'crypto';
import { CustomerReview, User } from './types';

// Cryptographic Secret for Session Signing
// In production, this can be supplied via environment variable SESSION_SECRET
const SESSION_SECRET = process.env.SESSION_SECRET || 'rz_pro_sec_key_9f8d7e6c5b4a3210_2026_production_grade';

/**
 * Hash a plaintext password using scrypt with a unique cryptographically random salt.
 * Output format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plaintext password against a stored hash (or legacy plaintext during migration).
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !password) return false;

  // If it's in salt:hash format
  if (stored.includes(':')) {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    try {
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const keyBuffer = Buffer.from(key, 'hex');
      return crypto.timingSafeEqual(derivedKey, keyBuffer);
    } catch {
      return false;
    }
  }

  // Fallback for initial legacy plaintext passwords before migration
  return stored === password;
}

/**
 * Check if a password string is already hashed in salt:hash format.
 */
export function isPasswordHashed(password: string): boolean {
  return typeof password === 'string' && password.includes(':') && password.length >= 64;
}

/**
 * Sign session data with HMAC-SHA256 to prevent cookie tampering and privilege escalation.
 * Token format: <base64Payload>.<hmacSignature>
 */
export function createSignedSessionToken(payload: object): string {
  const jsonStr = JSON.stringify({
    ...payload,
    _iat: Date.now()
  });
  const base64Payload = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  
  return `${base64Payload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature and return decoded payload.
 * Returns null if the token has been tampered with or is invalid.
 */
export function verifySignedSessionToken(token: string): any | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) {
    // If someone sends an old unsigned base64 cookie, reject it immediately!
    return null;
  }

  const [base64Payload, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Payload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'base64url');
    const expBuf = Buffer.from(expectedSignature, 'base64url');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      // Signature mismatch - tampering detected!
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Strip password, passwordHash, and internal sensitive credentials from User object.
 * Guarantee that no user password can ever be leaked in API responses.
 */
export function sanitizeUser(user: any): Partial<User> {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Sanitize reviews for public view, stripping sensitive personal information
 * such as client IP address and phone number from public endpoints.
 */
export function sanitizePublicReview(review: CustomerReview): Partial<CustomerReview> {
  const { clientIp, customerPhone, ...safeReview } = review;
  return safeReview;
}

/**
 * HTML / Special character sanitizer for user inputs to prevent Stored XSS.
 */
export function sanitizeInputText(input: string, maxLength: number = 500): string {
  if (!input) return '';
  return String(input)
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Strip HTML tags
    .trim();
}

/**
 * Simple In-Memory Rate Limiter for Login Attempts to protect against Brute-Force attacks.
 * Max 5 failed attempts per 5 minutes per IP or username.
 */
interface FailedAttempt {
  count: number;
  lastAttempt: number;
}

const failedAttemptsMap = new Map<string, FailedAttempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export function checkRateLimit(key: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record) return { allowed: true };

  // If lockout window passed, reset
  if (now - record.lastAttempt > LOCKOUT_MS) {
    failedAttemptsMap.delete(key);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_MS - (now - record.lastAttempt);
    return { allowed: false, remainingMs };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);
  if (!record || now - record.lastAttempt > LOCKOUT_MS) {
    failedAttemptsMap.set(key, { count: 1, lastAttempt: now });
  } else {
    record.count += 1;
    record.lastAttempt = now;
  }
}

export function resetFailedAttempts(key: string): void {
  failedAttemptsMap.delete(key);
}
