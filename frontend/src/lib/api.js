/**
 * Central API utility for DMSM CCA.
 * All fetch calls should use `apiFetch` so the base URL is always
 * resolved from the environment — never hardcoded.
 *
 * Dev  → VITE_API_URL=http://localhost:5000   (set in .env)
 * Prod → VITE_API_URL=https://your-api.com    (set in .env.production)
 *        or leave empty to use a relative path if the frontend is
 *        served from the same origin as the API.
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Wrapper around `fetch` that prepends the API base URL and always
 * sends cookies (credentials: "include").
 *
 * @param {string} path      - e.g. "/api/auth/login"
 * @param {RequestInit} opts - standard fetch options
 */
export async function apiFetch(path, opts = {}) {
  const url = `${BASE}${path}`;
  const response = await fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  return response;
}

export default apiFetch;
