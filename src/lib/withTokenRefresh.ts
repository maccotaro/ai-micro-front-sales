/**
 * Token Refresh Retry Utility
 *
 * Provides automatic token refresh and retry logic for BFF proxy routes.
 * When a backend API returns 401/403 (token expired), this utility:
 * 1. Calls the token refresh endpoint
 * 2. Retries the original request with new tokens
 * 3. Returns the result or error
 *
 * Usage in API routes:
 * ```typescript
 * import { withTokenRefresh } from '@/lib/withTokenRefresh';
 *
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   return withTokenRefresh(req, res, async (token) => {
 *     const response = await fetch(`${SALES_API_URL}/api/endpoint`, {
 *       headers: { 'Authorization': `Bearer ${token}` }
 *     });
 *     return response;
 *   });
 * }
 * ```
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Refresh tokens by calling the backend auth service directly
 */
async function refreshTokens(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      console.error('No refresh token found in cookies');
      return null;
    }

    // Call auth service via API Gateway
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://host.docker.internal:8888';
    const refreshResponse = await fetch(`${gatewayUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!refreshResponse.ok) {
      console.error('Token refresh failed:', refreshResponse.status, refreshResponse.statusText);
      return null;
    }

    const data = await refreshResponse.json();

    if (!data.access_token || !data.refresh_token) {
      console.error('Invalid refresh response:', data);
      return null;
    }

    // Update cookies with new tokens
    const setCookieHeaders = [
      `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=${15 * 60}`,
      `refresh_token=${data.refresh_token}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=${60 * 60 * 24 * 30}`,
    ];

    res.setHeader('Set-Cookie', setCookieHeaders);

    // Update the request cookies for subsequent operations
    req.cookies.access_token = data.access_token;
    req.cookies.refresh_token = data.refresh_token;

    console.log('Token refresh successful');
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return null;
  }
}

/**
 * Execute an API call with automatic token refresh on 401/403 errors
 *
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param apiCall - Async function that makes the API call, receives token as parameter
 * @returns The API response
 */
export async function withTokenRefresh(
  req: NextApiRequest,
  res: NextApiResponse,
  apiCall: (token: string) => Promise<Response>
): Promise<void> {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    // First attempt with current token
    let response = await apiCall(token);

    // If 401 or 403, try to refresh token and retry once
    if (response.status === 401 || response.status === 403) {
      console.log(`Received ${response.status}, attempting token refresh...`);

      const newToken = await refreshTokens(req, res);

      if (newToken) {
        // Retry with new token
        console.log('Retrying request with refreshed token...');
        response = await apiCall(newToken);
      } else {
        // Refresh failed, return 401 to force re-login
        res.status(401).json({ error: 'Authentication failed. Please log in again.' });
        return;
      }
    }

    // Forward the response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      res.status(response.status).json(errorData);
      return;
    }

    // Handle 204 No Content (no response body)
    if (response.status === 204) {
      res.status(204).end();
      return;
    }

    const data = await response.json();
    const statusCode = response.status;
    res.status(statusCode).json(data);
  } catch (error) {
    console.error('Error in withTokenRefresh:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
