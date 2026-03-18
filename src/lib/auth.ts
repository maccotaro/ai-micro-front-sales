/**
 * Sales-specific auth utilities.
 *
 * Generic auth (login, logout, refresh, cookies, withTokenRefresh)
 * is provided by @maccotaro/ai-micro-lib-frontend/auth.
 */

export interface TenantInfo {
  tenant_id: string
  name: string
  slug: string
  is_active: boolean
}

export async function switchTenant(tenantId: string): Promise<{
  tenant_id: string
  tenant_name: string
}> {
  const response = await fetch('/api/auth/switch-tenant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tenant_id: tenantId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'テナント切替に失敗しました')
  }

  return response.json()
}

export async function resolveSlug(slug: string): Promise<TenantInfo | null> {
  try {
    const response = await fetch(
      `/api/auth/tenants/resolve-slug/${encodeURIComponent(slug)}`
    )
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}
