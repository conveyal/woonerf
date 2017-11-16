// @flow
describe('store', () => {
  beforeEach(() => jest.resetModules())
  afterEach(() => jest.resetModules())

  it('should create a development redux store with the reducers passed', () => {
    process.env.NODE_ENV = 'development'
    const createStore = require('../../../src/store')
    const store = createStore({})

    expect(store.dispatch).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.subscribe).toBeDefined()
  })

  it('should create a production redux store with the reducers passed', () => {
    process.env.NODE_ENV = 'production'
    const createStore = require('../../../src/store')
    const store = createStore({})

    expect(store.dispatch).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.subscribe).toBeDefined()
  })

  it('should create a test redux store with', () => {
    process.env.NODE_ENV = 'test'
    const createStore = require('../../../src/store')
    const store = createStore({})

    expect(store.dispatch).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.subscribe).toBeDefined()
    expect(store.getActions).toBeDefined()
  })
})
