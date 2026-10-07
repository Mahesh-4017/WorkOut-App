export async function api(path, options = {}) { const response = await fetch(`/api${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }); const payload = await response.json().catch(() => ({})); if (response.status === 401) { window.dispatchEvent(new CustomEvent('session-expired')); } if (!response.ok) throw new Error(payload.message || 'Request failed'); return payload; }
export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const remove = (path) => api(path, { method: 'DELETE' });
export async function uploadImage(file) {
  const body = new FormData();
  body.append('image', file);
  const response = await fetch('/api/media/images', { method: 'POST', credentials: 'include', body });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) window.dispatchEvent(new CustomEvent('session-expired'));
  if (!response.ok) throw new Error(payload.message || 'Image upload failed.');
  return payload.data;
}
