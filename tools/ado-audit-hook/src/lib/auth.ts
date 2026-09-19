import { timingSafeEqual } from 'node:crypto';

/**
 * Validates the Basic-auth password configured on the ADO Service Hook
 * against WEBHOOK_SECRET. Any username is accepted.
 */
export function isAuthorised(
  authorizationHeader: string | null | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  if (!authorizationHeader?.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(authorizationHeader.slice(6), 'base64').toString(
      'utf8',
    );
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  const password = sep >= 0 ? decoded.slice(sep + 1) : decoded;
  const a = Buffer.from(password, 'utf8');
  const b = Buffer.from(secret, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
