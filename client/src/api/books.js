const base = import.meta.env.VITE_API_URL;
if (!base) throw new Error('VITE_API_URL is not set');

export const isAbortError =(err)=>err instanceof DOMException && err.name==='AbortError';

async function request(path, options = {}) {
  const headers = options.body !== undefined ? { 'Content-Type': 'application/json' } : {};
  let res;
  try {
    res = await fetch(`${base}${path}`, { ...options, headers });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new Error('Could not reach the server.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export function getBooks(filters = {}, signal) {
  const params=new URLSearchParams();
  for (const[key,value] of Object.entries(filters)) {
    if (String(value).trim()!=='') params.set(key,value);
  }
  const query=params.toString();
  return request(`/api/books${query ? `?${query}` : ''}`,{ signal });
}
export const getStats=(signal)=>request('/api/stats', { signal });
export const createBook=(book)=>
  request('/api/books', { method: 'POST', body: JSON.stringify(book) });
export const replaceBook=(id, book)=>
  request(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(book) });
export const patchBook=(id, changes)=>
  request(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteBook=(id)=> request(`/api/books/${id}`, { method: 'DELETE' });