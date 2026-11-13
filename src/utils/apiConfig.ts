/**
 * API Endpoint Resolution Helper
 * Supports:
 * 1. Local & Same-Origin Node.js Express Backend (/api/...)
 * 2. Separate Node.js Backend configured via VITE_API_BASE_URL (e.g. https://sas4erp-api.onrender.com)
 *    for deployments where Frontend is hosted statically on GitHub Pages (/Sas4ERP/).
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const envBase =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || '';
  const storedBase =
    typeof localStorage !== 'undefined' ? localStorage.getItem('sas4erp_api_base_url') || '' : '';
  const base = (envBase || storedBase).trim().replace(/\/+$/, '');
  return base ? `${base}${cleanPath}` : cleanPath;
}

export async function fetchJsonSafe(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: any } | null> {
  try {
    const res = await fetch(getApiUrl(path), options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // e.g. Static host (GitHub Pages) returned 404.html instead of API JSON
      return null;
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return null;
  }
}
