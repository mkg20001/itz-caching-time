# its-caching-time

Cache your expensive code

# Usage

`opts`: Object
  - `storage`, `object(set(key, val), get(key), del(key))`: Simple KV storage interface
  - `storeAsString`, `boolean`: Store data as string instead of raw JS values

Result:
- `.set(key, val, ttl)`: Store the value `val` under `key` for `ttl` ms
- `.get(key)`: Get `key` if it's still valid
- `.del(key)`: Delete/Expire `key` prematurely

```js
const caching = require('its-caching-time')

// create a new in-memory cache
const cache = caching({})

// create a new cached entry
await cache.set('theAnswer', 'Is 42', 300) // caches 'theAnswer' for 300ms

// create a new cached function 'calc' which will cache for 3s
const cachedFunction = cache.proxy((a, b) => (a + b), {name: 'calc', ttl: 3000})

// create a new cached function 'fetch' which will cache for 3s and re-fetch in the background
const fetchFnc = cache.proxy((url) => fetchURL(url), {name: 'fetch', ttl: 3000, bgRefetch: true})
const content = await fetchFnc()
setTimeout(async () => {
  const oldContent = await fetchFnc() // this will re-fetch in the background. this is useful for values that don't change to often, like avatars, etc
}, 4000)
```
