'use strict'

function lock () {
  const locks = {}

  const main = {
    holdLock: async (id, prom, t) => {
      locks[id] = prom
      let e
      let r

      try {
        r = await prom
      } catch (err) {
        e = err
      }

      delete locks[id]

      if (t && e) { throw e }
      return r
    },
    waitLock: async (id, t) => {
      let e
      let r

      try {
        r = await locks[id]
      } catch (err) {
        e = err
      }

      if (t && e) { throw e }
      return r
    },
    runOnce: (id, fnc, t) => {
      return locks[id] ? main.waitLock(id, t) : main.holdLock(id, fnc(), t)
    }
  }

  return main
}

module.exports = lock
