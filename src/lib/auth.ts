import { cookies } from 'next/headers';
import { getUserById } from './dataStore';
import { User } from './types';

export function getSessionUser(): User | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth_session');
    if (!sessionCookie?.value) return null;

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const sessionData = JSON.parse(decoded);
    if (!sessionData?.id) return null;

    return getUserById(sessionData.id) || null;
  } catch {
    return null;
  }
}
