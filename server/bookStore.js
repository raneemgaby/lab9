const seed = [
  {id:1,title:'The Hobbit',author:'J.R.R. Tolkien',year:1937,genre:'fantasy',read:true,rating:5},
  {id:2,title:'Dune', author:'Frank Herbert', year:1965, genre:'fiction', read:true, rating: 4},
  {id:3,title:'Sapiens', author:'Yuval Noah Harari', year:2011, genre:'history', read:true, rating:4},
  {id:4,title:'A Brief History of Time', author:'Stephen Hawking', year:1988, genre:'science', read: false, rating:null},
  {id:5,title:'Atomic Habits', author:'James Clear', year:2018, genre:'non-fiction', read:rue, rating:4},
  {id:6,title:'The Name of the Wind', author:'Patrick Rothfuss', year:2007, genre:'fantasy', read: false, rating:null},
  {id:7,title:'1984', author:'George Orwell', year:1949, genre:'fiction', read:false, rating:null},
  {id:8,title:'Cosmos', author:'Carl Sagan', year:1980, genre:'science', read:true, rating:5},
];

let books = seed.map((book) => Object.freeze({ ...book }));
let nextId = seed.length + 1;

const delay = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));
const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

function isDuplicate(candidate, ignoreId = null) {
  return books.some(
    (b) => b.id !== ignoreId && sameText(b.title, candidate.title) && sameText(b.author, candidate.author),
  );
}
export async function listBooks() {                               
  await delay(); 
  return [...books];
}
export async function findBook(id) {
  await delay();
  return books.find((b) => b.id === id) ?? null;
}
export async function createBook(data) {
  await delay();
  if (isDuplicate(data)) return { conflict: true };
  const book = Object.freeze({ ...data, id: nextId });
  nextId = nextId + 1;
  books = [...books, book];
  return { book };
}
export async function replaceBook(id, data) {  //replaces the book with this id.
  await delay();
  if (!books.some((b) => b.id === id)) return { notFound: true };
  if (isDuplicate(data, id)) return { conflict: true };
  const book = Object.freeze({ ...data, id });
  books = books.map((b) => (b.id === id ? book : b));
  return { book };
}
export async function removeBook(id) {          //true if something was deleted,false if the id doesn't exist
  await delay();
  if (!books.some((b) => b.id === id)) return false;
  books = books.filter((b) => b.id !== id);
  return true;
}