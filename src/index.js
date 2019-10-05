'use strict'

const Clock = require('./clock')

function memoryStorage () {
  const storage = {}

  return {
    get: (key) => storage[key],
    set: (key, val) => (storage[key] = val)
  }
}

module.exports = async ({storage, storeAsString} = {}) => {
  if (!storage) { storage = memoryStorage() }

  const clock = Clock({
    set: async (key, val) => storage.set('e#' + key, storeAsString ? JSON.stringify(val) : val),
    get: async (key, val) => storeAsString ? JSON.parse(await storage.get('e#' + key)) : storage.get('e#' + key),
    del: async (key) => storage.del('e#' + key)
  }, id => storage.del(id))

  const main = {
    set: async (key, value, ttl) => {
      let newVal = {
        v: value,
        l: Date.now() + ttl
      }
      clock.addEvent(newVal.l, key)
      if (storeAsString) { newVal = JSON.stringify(newVal) }

      return storage.set(key, newVal)
    },
    get: async (key) => {
      let res = await storage.get(key)

      if (!res) { return null }

      if (storeAsString) { res = JSON.parse(res) }

      if (res.l >= Date.now()) {
        await storage.del(key)
        return null
      } else {
        return res.v
      }
    },
    del: async (key) => {
      return storage.del(key)
    }
  }
}
