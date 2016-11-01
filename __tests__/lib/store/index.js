/* globals describe, expect, it, jest */

describe('store', () => {
  it('should create a development redux store with the reducers passed', () => {
    jest.resetModules()
    process.env.NODE_ENV = 'development'
    const createStore = require('../../../lib/store')
    const store = createStore({})

    expect(store.env).toBe('development')
    expect(store.dispatch).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.subscribe).toBeDefined()
  })

  it('should create a production redux store with the reducers passed', () => {
    jest.resetModules()
    process.env.NODE_ENV = 'production'
    const createStore = require('../../../lib/store')
    const store = createStore({})

    expect(store.env).toBe('production')
    expect(store.dispatch).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.subscribe).toBeDefined()
  })
})
