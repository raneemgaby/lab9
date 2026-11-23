export const genres = ['fiction','non-fiction','science','history','fantasy','other'];
const book_fields = ['title', 'author', 'year', 'genre', 'read', 'rating'];
const sort_fields = ['title', 'author', 'year', 'rating'];

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function parseId(raw) {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
export function pickBookFields(body) {
  const picked = {};
  for (const field of book_fields) {
    if (Object.hasOwn(body, field)) picked[field] = body[field];
  }
  return picked;
}
export function validateBook(input) {
  if (!isPlainObject(input)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const errors = [];
  const currentYear = new Date().getFullYear();

  const title=typeof input.title==='string' ? input.title.trim() :'';
  if (title.length<1 || title.length>100) {
    errors.push('title must be a string of 1 to 100 characters.');
  }

  const author=typeof input.author==='string' ? input.author.trim() :'';
  if (author.length<1 || author.length>100) {
    errors.push('author must be a string of 1 to 100 characters.');
  }
  if (!Number.isInteger(input.year) || input.year<1000 || input.year>currentYear) {
    errors.push(`year must be an integer between 1000 and ${currentYear}.`);
  }
  if (!genres.includes(input.genre)) {
    errors.push(`genre must be one of: ${genres.join(', ')}.`);
  }

  const read=input.read===undefined? false :input.read;
  if (typeof read!=='boolean') {
    errors.push('read must be true or false.');
  }

  const rating=input.rating===undefined ? null :input.rating;
  if (rating!==null && (!Number.isInteger(rating) || rating<1 || rating>5)) {
    errors.push('"rating" must be an integer from 1 to 5, or null.');
  } else if (rating!==null && read!==true) {
    errors.push('rating can only be set when "read" is true.');
  }
  if (errors.length>0) {
    return { error: errors.join(' ')};
  }
  return {book:{title,author,year:input.year,genre:input.genre,read,rating}};
}

export function parseListQuery(query) {
  const names = ['genre','read','q','sort','order','limit','page'];

  for (const name of names) {
    if (Array.isArray(query[name])) {
      return {error:`Query parameter "${name}" must not be repeated.`};
    }
    if (query[name]!==undefined && typeof query[name]!=='string') {
      return {error: `Query parameter "${name}" is invalid.`};
    }
  }
  
  const options ={sort:'id',order:'asc',limit:50,page:1};

  if (query.genre!==undefined) {
    if (!genres.includes(query.genre)) {
      return {error:`"genre" must be one of: ${genres.join(', ')}.`};
    }
    options.genre=query.genre;
  }
  if (query.read!==undefined) {
    if (query.read!=='true' && query.read!=='false') {
      return {error:'read must be "true" or "false".'};
    }
    options.read=query.read==='true';
  }
  if (query.q!==undefined) {
    const q=query.q.trim();
    if (q==='') return {error:'q must not be empty.'};
    options.q=q.toLowerCase();
  }
  if (query.sort!==undefined) {
    if (!sort_fields.includes(query.sort)) {
      return {error:`sort must be one of: ${sort_fields.join(', ')}.`};
    }
    options.sort=query.sort;
  }
  if (query.order!==undefined) {
    if (query.order!=='asc' && query.order !=='desc') {
      return { error:'order must be "asc" or "desc".'};
    }
    options.order=query.order;
  }
  if (query.limit!==undefined) {
    const limit= /^\d+$/.test(query.limit)? Number(query.limit):NaN;
    if (!(limit>=1 && limit<=50)) {
      return {error:'limit must be an integer from 1 to 50.'};
    }
    options.limit=limit;
  }
  if (query.page!==undefined) {
    const page= /^[1-9]\d*$/.test(query.page)? Number(query.page):NaN;
    if (!Number.isSafeInteger(page)) {
      return {error:'page must be a positive integer.'};
    }
    options.page=page;
  }
  return {options};
}
