'use strict'

const crypto = require('crypto')

async function clock (storage, triggerEvent) {
  let events = []
  const eventsMap = {}

  let hitLock
  let nextHit
  let nextHitTime
  let nextHitWanted

  async function doHit () {
    hitLock = true

    let next

    while ((next = events[0])) {
      let event = eventsMap[next]

      if (event.when <= Date.now()) {
        try {
          await triggerEvent(event.what)
          events.pop()
        } catch (err) {
          console.error(err)
        }
      } else {
        break
      }
    }

    await saveEvents()

    hitLock = false

    if (nextHitWanted) {
      adjustHit(nextHitWanted)
      nextHitWanted = null
    }
  }

  async function adjustHit (wanted) {
    if (nextHitTime !== wanted) {
      if (hitLock) {
        nextHitWanted = wanted
      }

      clearTimeout(nextHit)
      nextHitTime = wanted
      setTimeout(doHit, Date.now() - nextHitTime)
    }
  }

  async function saveEvents () {
    await storage.set(events, events.join(','))
  }

  async function loadEvents () {
    events = await storage.get('events')
    await Promise.all(events.map(async id => {
      eventsMap[id] = await storage.get(id)
    }))
  }

  await loadEvents()

  return {
    addEvent: async (when, what) => {
      let id

      while (!id || eventsMap[id]) {
        id = crypto.randomBytes(2).toString('hex')
      }

      eventsMap[id] = what
      events.push(id)
      events = events.sort((a, b) =>
        eventsMap[a].when - eventsMap[b].when)

      await storage.set(id, {when, what})
      await saveEvents()
    },
    removeEvent: async (id) => {
      delete eventsMap[id]
      events = events.filter(e => e !== id)

      await storage.del(id)
      await saveEvents()
    }
  }
}

module.exports = clock
