'use strict'

const {deepEqual: eq} = require('assert').strict
const main = require('..')
const wait = (i) => new Promise((resolve, reject) => setTimeout(resolve, i))

describe('caching', () => {
  it('stores a value, retrives it', async () => {
    const c = await main({})
    await c.set('test', 'test', 1000)
    eq(await c.get('test'), 'test')
  })

  it('stores a value, expires it, can\'t retrive it', async () => {
    const c = await main({})
    await c.set('test', 'test', 10)

    await wait(100)

    eq(await c.get('test'), null)
  })
})

describe('proxy', () => {
  it('can create a proxy and use it', async () => {
    const c = await main({})
    const p = c.proxy((a, b) => (a + b), {name: 'test', ttl: 1000})

    eq(await p(1, 2), 3)
    eq(await p(1, 2), 3)
  })
})
