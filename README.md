## Run 
# Server (terminal 1): # http://localhost:3000
cd server
npm install
npm run dev

# Client (terminal 2): # http://localhost:5173
cd client
copy .env.example .env
npm install
npm run dev

## Testing evidence (curl --include)
1. List, two query parameters: `curl --include "http://localhost:3000/api/books?genre=fantasy&sort=year&order=desc"`
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 235
ETag: W/"eb-SbMFuPIYztG51/puZcsHPuv3lug"
Date: Mon, 23 Nov 2026 19:22:33 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":6,"title":"The Name of the Wind","author":"Patrick Rothfuss","year":2007,"genre":"fantasy","read":false,"rating":null},{"id":1,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}]

2. One book: `curl --include http://localhost:3000/api/books/1`
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 108
ETag: W/"6c-wksYbf6e3ZJvQpjSjKuybvZ7BPQ"
Date: Mon, 23 Nov 2026 19:24:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}

3. Stats BEFORE: `curl --include http://localhost:3000/api/stats`
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-MSrGmn48KGq0jBdDMPfzE7WD5+4"
Date: Mon, 23 Nov 2026 19:24:23 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":8,"read":5,"unread":3,"averageRating":4.4,"byGenre":{"fantasy":2,"fiction":2,"history":1,"science":2,"non-fiction":1}}

4. 201 + Location: `curl --include -X POST -H "Content-Type: application/json" -d '{"title":"Neuromancer","author":"William Gibson","year":1984,"genre":"fiction"}' http://localhost:3000/api/books`
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/9
Content-Type: application/json; charset=utf-8
Content-Length: 110
ETag: W/"6e-zpEkSD8mR7liPmpWVGuEwaHzGqE"
Date: Mon, 23 Nov 2026 19:25:01 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Foundation","author":"Isaac Asimov","year":1951,"genre":"fiction","read":false,"rating":null,"id":9}

5. Stats AFTER: `curl --include http://localhost:3000/api/stats`
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/9
Content-Type: application/json; charset=utf-8
Content-Length: 110
ETag: W/"6e-zpEkSD8mR7liPmpWVGuEwaHzGqE"
Date: Mon, 23 Nov 2026 19:25:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Foundation","author":"Isaac Asimov","year":1951,"genre":"fiction","read":false,"rating":null,"id":9}

6. 400 invalid body: `curl --include -X POST -H "Content-Type: application/json" -d '{"title":"X","author":"Y","year":3000,"genre":"fiction"}' http://localhost:3000/api/books`
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 235
ETag: W/"eb-SbMFuPIYztG51/puZcsHPuv3lug"
Date: Mon, 23 Nov 2026 19:26:43 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":6,"title":"The Name of the Wind","author":"Patrick Rothfuss","year":2007,"genre":"fantasy","read":false,"rating":null},{"id":1,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}]

7. 400 repeated parameter: `curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"`
Set-Content bad.json '{"title":"X","author":"Y","year":3000,"genre":"fiction"}'
curl.exe --include -X POST -H "Content-Type: application/json" --data "@bad.json" http://localhost:3000/api/books

8. 404 missing: `curl --include http://localhost:3000/api/books/999`
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-A+62jjNt7tbVrdUVsBJeHd6cu0A"
Date: Mon, 23 Nov 2026 19:27:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

9. 409 duplicate: repeat command 4 (or use `"title":"dune","author":"FRANK HERBERT"`)
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 31
ETag: W/"1f-7tx5AbUOAFQjSUt2VnM/LRQlnBo"
Date: Mon, 23 Nov 2026 19:28:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"error":"Book 999 not found."}

10. PUT vs PATCH on book 2:
 - `curl --include -X PATCH -H "Content-Type: application/json" -d '{"rating":5}' http://localhost:3000/api/books/2`
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-S21Ro1Z1WZJigG5AjrvC85yhTFI"
Date: Mon, 23 Nov 2026 19:29:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"id":2,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":4}

 - `curl --include -X PUT -H "Content-Type: application/json" -d '{"rating":5}' http://localhost:3000/api/books/2` (fails: incomplete body)
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-uTM2eDjpLkp0oGP9CYEKykRj5GQ"
Date: Mon, 23 Nov 2026 19:30:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":5,"id":2}

- `curl --include -X PUT -H "Content-Type: application/json" -d '{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction"}' http://localhost:3000/api/books/2` (rating resets to null)
HTTP/1.1 200 OK
X-Powered-By: Express                           
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin                               
Content-Type: application/json; charset=utf-8
Content-Length: 105      
ETag: W/"69-5DNc771ON2wLQsfHQkFH1/2agWU"
Date: Mon, 23 Nov 2026 19:31:09 GMT
Connection: keep-alive                                                                                  
Keep-Alive: timeout=5
{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":false,"rating":null,"id":2}

11. 204 then 404: run `curl --include -X DELETE http://localhost:3000/api/books/3` twice.
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Mon, 23 Nov 2026 19:32:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5

HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-aIBs/f4ImIKtzLWaCJpCOvAib1A"
Date: Mon, 23 Nov 2026 19:33:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"error":"Book 3 not found."}

12. Malformed JSON: `curl --include -X POST -H "Content-Type: application/json" -d 'bad' http://localhost:3000/api/books`
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 43
ETag: W/"2b-8D2cvtnEV8j67lcLJhpMJYB3yUM"
Date: Mon, 23 Nov 2026 19:33:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"error":"Request body is not valid JSON."}

13. Unknown API path: `curl --include http://localhost:3000/api/nothing`
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 23 Nov 2026 19:34:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"error":"Not found"}

14. Crash: `curl --include http://localhost:3000/api/crash`
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-cI8B1wZuBEyTE5ClDvphKZx7wd0"
Date: Mon, 23 Nov 2026 19:34:34 GMT
Connection: keep-alive
Keep-Alive: timeout=5
{"error":"Something went wrong"}

15. Preflight: `curl --include -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: PATCH" -H "Access-Control-Request-Headers: content-type" http://localhost:3000/api/books/1`
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0
Date: Mon, 23 Nov 2026 19:35:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

### Network tab 
In Chrome DevTools -> Network, I toggled a book as read in the client at http://localhost:5173. Because the request is a PATCH with a Content-Type: application/json header, the browser first sent an OPTIONS preflight request to http://localhost:3000/api/books/<id>.


## Reasoning questions
1. Parameters. The id is a route parameter because it identifies one specific resource (/api/books/7 is "the book number 7"), while genre and sort only change how a collection is filtered or ordered, so they are optional query parameters. If id were in the query string, the path would no longer name a resource, /api/books would have to mean both "the list" and "one book", and caching, links and the DELETE /api/books/:id convention would get messy.
2. Body parsing (experiment). CHECK: I moved app.use(express.json()) below the routes and sent a POST. req.body was undefined because the request reached my route before any body parsing had run. My handler checks that the body is an object, so the POST returned 400 ("Request body must be a JSON object."). (If your handler returned something else, write what you saw.) Middleware runs in the order it is registered, so the parser must come before the routes.
3. One response (experiment). CHECK: I removed the return before the early 404 in GET /api/books/:id and requested a missing id. The client still received the 404, but the handler kept running and tried to send a second response with res.json(book). The server threw ERR_HTTP_HEADERS_SENT ("Cannot set headers after they are sent to the client") and logged it. Without return, the function does not stop after sending, and a request can only get one response.
4.PUT and PATCH. PATCH is better when the user changes one thing, for example the client's read checkbox or rating select sends only { "rating": 5 }, and the other fields stay as they are. PUT is better when the whole book is replaced, such as the Edit form, which sends every field; fields left out go back to their defaults (in my test, read became false and rating became null).
5. CORS (experiment). CHECK: I started the server with CLIENT_ORIGIN set to a wrong value (for example http://localhost:9999). The browser console showed an error saying the request was blocked by CORS policy, because the Access-Control-Allow-Origin header did not match the page's origin (http://localhost:5173), and the client showed "Could not reach the server". Write whether YOUR server log showed the request: a simple request such as GET still reaches the server, but a request with a preflight stops at the OPTIONS step. curl still works because CORS is a rule enforced by the browser, not the server; curl is not a browser and ignores those headers.
6. Validation. Client-side checks only help the user, because anyone can bypass the form with curl, Postman or edited JavaScript and send any data. The server is the only code we control, so it must validate every request to protect the data, enforce rules such as the rating-only-when-read rule, and detect things only it knows, like duplicates.
7. State (experiment). CHECK: I restarted the server and the data went back to the 8 seed books: books I had added were gone and deleted ones were back. This shows that the data lives only in the server process's memory (a JavaScript variable), and disappears when the process ends. To keep it, we need persistent storage, such as a database (or at least writing to a file).

## Self-study
URLSearchParams (MDN). I read that URLSearchParams builds a query string from key/value pairs and percent-encodes the values, so a search like Tolkien & co cannot break the URL. In api/books.js I create one, call .set(key, value) for every filter that is not empty, and add .toString() to the URL.

localeCompare (MDN). a.localeCompare(b) compares strings using language rules instead of raw character codes, so "apple" and "Banana" sort alphabetically regardless of case. I used it with { sensitivity: 'base' } for sorting by title and author on the server, and it returns a negative, zero or positive number like a normal sort comparator.

import.meta.env and VITE_ (Vite docs). Vite replaces import.meta.env.VITE_API_URL with the value from .env when it serves or builds the app. Only variables whose names start with VITE_ are exposed to browser code, so private variables in the same file don't leak into the bundle. I used it for the API base URL, and I restart Vite after editing .env because it is read at startup.

204 in Express 5. A 204 No Content response must not have a body, so I use res.status(204).end(), which sends only the status line and headers. The client's request helper checks response.status === 204 and returns null instead of calling response.json().

Cancelling fetch (MDN AbortController). I create an AbortController, pass controller.signal to fetch, and call controller.abort() in the useEffect cleanup. The pending promise then rejects with a DOMException named AbortError, which my code recognises (isAbortError) and ignores, so an old response can never overwrite a newer one.

## File Organisation: The project lives in one repository with server/ and client/ folders alongside a root .gitignore and README.md. Inside server/, server.js sets up Express 5, CORS, JSON parsing, routes, and error handling, booksStore.js manages the in-memory seed books and async data functions, validate.js handles manual validation, and package.json uses "type": "module" with start and dev scripts. Inside client/, src/api/books.js wraps fetch calls for the API, src/components/ holds the UI pieces, App.jsx and main.jsx wire up the React app, and .env.example, index.html, and package.json support the Vite setup.

## Faced Challenges: Writing all validation from scratch without libraries like zod or joi—covering trimmed strings, year and rating rules, read-dependent ratings, case-insensitive duplicate (title, author) checks, and 400/409 JSON errors—took careful thought. Keeping booksStore.js async with simulated delays and immutable data updates was also tricky, especially when merging PATCH updates, ignoring body id and unknown fields, separating 400 vs. 404 IDs, validating query options and repeated params, and sorting copies without mutating stored data. Finally, configuring exact-origin cors without a Vite proxy, sticking to ES modules, returning 400 on bad JSON, catching 500 errors cleanly, and building the React UI and src/api/books.js client with hooks and no UI libraries tied the whole flow together.