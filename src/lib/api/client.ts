import { auth } from '../../firebase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let user = auth.currentUser;
  if (!user && typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
    user = auth.currentUser;
  }
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const targetUrl = url.startsWith('http') ? url : `${apiBase}${url}`;
  const response = await fetch(targetUrl, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
