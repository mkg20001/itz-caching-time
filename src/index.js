'use strict'

const Clock = require('./clock')
const Lock = require('./lock')

function memoryStorage () {
  const storage = {}

  return {
    get: (key) => storage[key],
    set: (key, val) => (storage[key] = val),
    del: (key) => (delete storage[key])
  }
}

module.exports = async ({storage, storeAsString} = {}) => {
  if (!storage) { storage = memoryStorage() }

  const clock = await Clock({
    set: async (key, val) => storage.set('e#' + key, storeAsString ? JSON.stringify(val) : val),
    get: async (key, val) => storeAsString ? JSON.parse(await storage.get('e#' + key)) : storage.get('e#' + key),
    del: async (key) => storage.del('e#' + key)
  }, id => storage.del(id))
  const lock = Lock()

  const main = {
    set: async (key, value, ttl) => {
      let newVal = {
        v: value,
        l: ttl ? Date.now() + ttl : 0
      }
      if (newVal.l) { clock.addEvent(newVal.l, key) }
      if (storeAsString) { newVal = JSON.stringify(newVal) }

      return storage.set(key, newVal)
    },
    get: async (key) => {
      let res = await storage.get(key)

      if (!res) { return null }

      if (storeAsString) { res = JSON.parse(res) }

      if (res.l && res.l <= Date.now()) {
        await storage.del(key)
        return null
      } else {
        return res.v
      }
    },
    del: async (key) => {
      return storage.del(key)
    },
    proxy: (fnc, {name, ttl, bgRefetch}) => {
      return async (...a) => {
        const key = fnc + 'Ω' + JSON.stringify(a)

        let res = await main.get(name, true)

        if (bgRefetch) {
          if (!res) {
            return lock.runOnce(key, async () => {
              let res = {
                expiry: ttl + Date.now(),
                res: await fnc(...a)
              }

              await main.set(key, res, 0)

              return res.res
            }, true)
          } else {
            if (res.expiry >= Date.now()) {
              lock.runOnce(key, async () => {
                let res = {
                  expiry: ttl + Date.now(),
                  res: await fnc(...a)
                }

                await main.set(key, res, 0)
              })
            }

            return res.res
          }
        } else {
          if (!res) {
            return lock.runOnce(key, async () => {
              let res = await fnc(...a)
              await main.set(key, res, 0)

              return res
            }, true)
          }

          return main.get(key)
        }
      }
    }
  }

  return main
}
