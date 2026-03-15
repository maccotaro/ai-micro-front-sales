/**
 * Cookie constants for front-sales.
 *
 * Uses "sales_" prefix to avoid collision with front-user which
 * also runs on localhost (cookies are scoped by domain+path, NOT port).
 */

export const ACCESS_TOKEN_COOKIE = 'sales_access_token';
export const REFRESH_TOKEN_COOKIE = 'sales_refresh_token';

export function buildCookieFlags(): string {
  return [
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/** Max-Age in seconds */
export const ACCESS_TOKEN_MAX_AGE = 900; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 604800; // 7 days

export function setTokenCookies(
  res: { setHeader(name: string, value: string[]): void },
  accessToken: string,
  refreshToken: string
): void {
  const flags = buildCookieFlags();
  res.setHeader('Set-Cookie', [
    `${ACCESS_TOKEN_COOKIE}=${accessToken}; ${flags}; Max-Age=${ACCESS_TOKEN_MAX_AGE}`,
    `${REFRESH_TOKEN_COOKIE}=${refreshToken}; ${flags}; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
  ]);
}

export function clearTokenCookies(
  res: { setHeader(name: string, value: string[]): void }
): void {
  res.setHeader('Set-Cookie', [
    `${ACCESS_TOKEN_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
    `${REFRESH_TOKEN_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
  ]);
}
