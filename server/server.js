import express from 'express';
import cors from 'cors';
import {listBooks,findBook,createBook,replaceBook,removeBook}from './booksStore.js';
import {parseId,parseListQuery,pickBookFields,validateBook,isPlainObject}from './validate.js';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

function compareBooks(sort, order) {
  const direction = order === 'desc' ? -1 : 1;
  return (a, b) => {
    if (sort === 'rating') {
      // Unrated books always go last, whatever the order.
      if (a.rating === null && b.rating === null) return a.id - b.id;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
    }
    const diff =
      sort === 'title' || sort === 'author'
        ? a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' })
        : a[sort] - b[sort];
    return diff !== 0 ? diff * direction : a.id - b.id;
  };
}

app.get('/api/books', async (req, res) => {
  const { options, error } = parseListQuery(req.query);
  if (error) return res.status(400).json({ error });
  const all = await listBooks();
  const filtered = all.filter(
    (b) =>
      (options.genre === undefined || b.genre === options.genre) &&
      (options.read === undefined || b.read === options.read) &&
      (options.q === undefined ||
        b.title.toLowerCase().includes(options.q) ||
        b.author.toLowerCase().includes(options.q)),
  );
  const sorted = [...filtered].sort(compareBooks(options.sort, options.order)); // sort a copy
  const start = (options.page - 1) * options.limit;
  res.json(sorted.slice(start, start + options.limit));
});

app.get('/api/stats', async (req, res) => {
  const books = await listBooks();
  const read = books.filter((b) => b.read).length;
  const ratings = books.filter((b) => b.rating !== null).map((b) => b.rating);
  const sum = ratings.reduce((total, r) => total + r, 0);
  const byGenre = books.reduce(
    (counts, b) => ({ ...counts, [b.genre]: (counts[b.genre] ?? 0) + 1 }),
    {},
  );
  res.json({
    total: books.length,
    read,
    unread: books.length - read,
    averageRating: ratings.length > 0 ? Math.round((sum / ratings.length) * 100) / 100 : null,
    byGenre,
  });
});

app.get('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Book id must be a positive integer.' });
  const book = await findBook(id);
  if (!book) return res.status(404).json({ error: `Book ${id} not found.` });
  res.json(book);
});

app.post('/api/books', async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }
  const { book: valid, error } = validateBook(pickBookFields(req.body));
  if (error) return res.status(400).json({ error });
  const result = await createBook(valid);
  if (result.conflict) {
    return res.status(409).json({ error: 'A book with the same title and author already exists.' });
  }
  res.status(201).location(`/api/books/${result.book.id}`).json(result.book);
});

app.put('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Book id must be a positive integer.' });
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }
  const { book: valid, error } = validateBook(pickBookFields(req.body));
  if (error) return res.status(400).json({ error });
  const result = await replaceBook(id, valid);
  if (result.notFound) return res.status(404).json({ error: `Book ${id} not found.` });
  if (result.conflict) {
    return res.status(409).json({ error: 'A book with the same title and author already exists.' });
  }
  res.json(result.book);
});

app.patch('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Book id must be a positive integer.' });
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }
  const existing = await findBook(id);
  if (!existing) return res.status(404).json({ error: `Book ${id} not found.` });
  const merged = { ...existing, ...pickBookFields(req.body) };
  const { book: valid, error } = validateBook(merged);
  if (error) return res.status(400).json({ error });
  const result = await replaceBook(id, valid);
  if (result.notFound) return res.status(404).json({ error: `Book ${id} not found.` });
  if (result.conflict) {
    return res.status(409).json({ error: 'A book with the same title and author already exists.' });
  }
  res.json(result.book);
});

app.delete('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Book id must be a positive integer.' });
  const deleted = await removeBook(id);
  if (!deleted) return res.status(404).json({ error: `Book ${id} not found.` });
  res.status(204).end();
});

app.get('/api/crash', async () => {
  await Promise.resolve();
  throw new Error('Deliberate crash');
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});
