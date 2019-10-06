'use strict'

function lock () {
  const locks = {}

  const main = {
    holdLock: async (id, prom, t) => {
      locks[id] = prom
      let e

      try {
        await prom
      } catch (err) {
        e = err
      }

      delete locks[id]

      if (t && e) { throw e }
    },
    waitLock: async (id, t) => {
      let e

      try {
        await locks[id]
      } catch (err) {
        e = err
      }

      await locks[id]

      if (t && e) { throw e }
    },
    runOnce: (id, fnc) => {
      return main.holdLock(id, fnc())
    }
  }
}

module.exports = lock
