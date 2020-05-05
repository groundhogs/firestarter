// Based on https://adactio.com/journal/13540 
// Based on https://books.google.com/books?id=xdyZDwAAQBAJ&pg=PA87&lpg=PA87&dq=serviceworker+onactivate+clean+up&source=bl&ots=0MxtuGT540&sig=ACfU3U3itwPnqRomF_4XUT6kbZGMxsCLmQ&hl=es-419&sa=X&ved=2ahUKEwi_iumwlZvpAhWxH7kGHayXA1wQ6AEwC3oECA0QAQ#v=onepage&q=serviceworker%20onactivate%20clean%20up&f=false
// With modifications by Carlos Vergara <cfvergara@gmail.com>

const CURRENT_CACHE_KEY = 'files';

addEventListener('activate', activateEvent =>
  activateEvent.waitUntil(
    caches.keys()
    .then(names => Promise.all(
      names
        .filter(name => name !== CURRENT_CACHE_KEY)
        .map(name => caches.delete(name))
    ))
));

addEventListener('fetch',  fetchEvent => {
  const request = fetchEvent.request;
  if (request.method !== 'GET') {
    return;
  }

  fetchEvent.respondWith(async function() {
    const fetchPromise = fetch(request);

    fetchEvent.waitUntil(async function() {
      const responseFromFetch = await fetchPromise;
      const responseCopy = responseFromFetch.clone();
      const myCache = await caches.open(CURRENT_CACHE_KEY);

      return myCache.put(request, responseCopy);
    }());

    if (request.headers.get('Accept').includes('text/html')) {
      try {
        return await fetchPromise;
      }
      catch(error) {
        return caches.match(request);
      }
    } else {
      const responseFromCache = await caches.match(request);
      return responseFromCache || fetchPromise;
    }
  }());
});