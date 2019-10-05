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

// create a new cached function 'calc' which will cache for 3000s by default
const cachedFunction = cache.proxy((a, b) => (a + b), 'calc', 3000)
```
