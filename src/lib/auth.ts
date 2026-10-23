import { cookies } from 'next/headers';
import { getUserById } from './dataStore';
import { verifySignedSessionToken } from './security';
import { User } from './types';

export function getSessionUser(): User | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth_session');
    if (!sessionCookie?.value) return null;

    // Cryptographically verify HMAC-SHA256 signature
    const sessionData = verifySignedSessionToken(sessionCookie.value);
    if (!sessionData?.id) return null;

    const user = getUserById(sessionData.id);
    if (!user || user.isActive === false) return null;

    return user;
  } catch {
    return null;
  }
}
