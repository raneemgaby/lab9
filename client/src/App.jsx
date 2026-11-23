import { useEffect, useState } from 'react';
import * as api from './api/books.js';
import FilterBar from './components/FilterBar.jsx';
import BookList from './components/BookList.jsx';
import BookForm from './components/BookForm.jsx';
import StatsPanel from './components/StatsPanel.jsx';

const initialFilters = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const[filters,setFilters]=useState(initialFilters);
  const[books,setBooks]=useState([]);
  const[loading,setLoading]=useState(true);
  const[loadError,setLoadError]=useState('');
  const[stats,setStats] =useState(null);
  const[statsError,setStatsError]=useState('');
  const[editingBook,setEditingBook]=useState(null);
  const[actionError,setActionError]=useState('');
  const[reloadCount,setReloadCount]=useState(0);

  function refresh() {
    setReloadCount((count) => count + 1);
  }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    api
      .fetchBooks(filters, controller.signal)
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (api.isAbortError(err)) return; 
        setLoadError(err.message);
        setLoading(false);
      });
    return () => controller.abort(); 
  }, [filters, reloadCount]);
  useEffect(() => {
    const controller = new AbortController();
    setStatsError('');
    api
      .fetchStats(controller.signal)
      .then(setStats)
      .catch((err) => {
        if (api.isAbortError(err)) return;
        setStatsError(err.message);
      });

    return () => controller.abort();
  }, [reloadCount]);

  async function handleCreate(book) {
    await api.createBook(book);
    setActionError('');
    refresh();
  }
  async function handleReplace(book) {
    await api.replaceBook(editingBook.id, book);
    setActionError('');
    setEditingBook(null);
    refresh();
  }
  async function handlePatch(id, changes) {
    await api.patchBook(id, changes);
    setActionError('');
    refresh();
  }
  async function handleDelete(id) {
    await api.deleteBook(id);
    setActionError('');
    if (editingBook !== null && editingBook.id === id) setEditingBook(null);
    refresh();
  }
  return (
    <div className="app">
      <h1>Reading List</h1>

      <section>
        <h2>Statistics</h2>
        <StatsPanel stats={stats} error={statsError} />
      </section>

      <section>
        <BookForm
          key={editingBook === null ? 'new' : editingBook.id}
          book={editingBook}
          onSubmit={editingBook === null ? handleCreate : handleReplace}
          onCancel={() => setEditingBook(null)}
        />
      </section>

      <section>
        <h2>Books</h2>
        <FilterBar filters={filters} onChange={setFilters} />
        {actionError && <p className="error" role="alert">{actionError}</p>}
        <BookList
          books={books}
          loading={loading}
          error={loadError}
          onRetry={refresh}
          onPatch={handlePatch}
          onEdit={setEditingBook}
          onDelete={handleDelete}
          onError={setActionError}
        />
      </section>
    </div>
  );
}

