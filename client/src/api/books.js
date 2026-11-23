const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
 const headers = options.body ? { 'Content-Type': 'application/json' } : {};
 const res = await fetch(`${BASE}${path}`, { ...options, headers });

 if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
 }
 return res.status === 204 ? null : res.json();
 }
export const getBooks = (query = '') => request(`/api/books${query}`);
export const createBook = (book) =>
    request('/api/books', { method: 'POST', body: JSON.stringify(book) });
export const deleteBook = (id) => request(`/api/books/${id}`, { method: 'DELETE' });