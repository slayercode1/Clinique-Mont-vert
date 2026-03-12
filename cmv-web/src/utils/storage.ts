export const STORAGE_KEY = 'cmv_ssid';

export function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY)}`,
    'Content-Type': 'application/json',
  };
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/';
    throw new Error('Session expirée');
  }

  return response;
}
