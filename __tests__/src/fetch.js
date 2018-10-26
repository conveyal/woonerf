// @flow
import nock from 'nock'

import fetch, {
  abortAllFetches,
  abortFetch,
  ABORT_FETCH_FAILED,
  ABORTED_FETCH,
  fetchMultiple,
  getID
} from '../../src/fetch'
import createStore from '../../src/store'

const URL = 'http://fakeurl.com'

describe('fetch', () => {
  it('should dispatch a fetch action and call next', (done) => {
    const store = createStore()

    nock(URL)
      .get('/')
      .reply(200, {})

    const action = fetch({
      url: URL,
      next: (err, res) => done(err, res)
    })

    store.dispatch(action)
  })

  it('should automatically serialize json bodies', (done) => {
    const store = createStore()

    const body = {
      data: 'important'
    }

    nock(URL)
      .post('/', body)
      .reply(200, (path, requestBody) => {
        expect(requestBody === JSON.stringify(body)).toBeTruthy()
        return 'good'
      })

    const action = fetch({
      url: URL,
      options: {
        method: 'post',
        body
      },
      next (response) {
        response.text().then(value => {
          expect(value).toEqual('good')
          done()
        })
      }
    })

    store.dispatch(action)
  })

  it('should work with FormData', (done) => {
    const store = createStore()
    const data = new window.FormData()
    data.append('name', 'world')

    nock(URL)
      .post('/')
      .reply(200, 'FormData')

    const action = fetch({
      url: URL,
      options: {
        method: 'post',
        body: data
      },
      next: (error, response) => {
        response.text().then(value => {
          expect(value).toEqual('FormData')
          done(error)
        })
      }
    })

    store.dispatch(action)
  })

  it('should automatically parse json responses', (done) => {
    const store = createStore()
    nock(URL)
      .get('/')
      .reply(200, {hello: 'world'})

    const action = fetch({
      url: URL,
      next: (error, response) => {
        expect(response.value).toEqual({hello: 'world'})
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should fetch multiple urls in one go', (done) => {
    const store = createStore()
    nock(URL)
      .get('/one')
      .reply(200, 'one', {'Content-Type': 'text/plain'})

    nock(URL)
      .get('/two')
      .reply(200, 'two', {'Content-Type': 'text/plain'})

    const action = fetchMultiple({
      fetches: [{
        url: `${URL}/one`
      }, {
        url: `${URL}/two`
      }],
      next: (error, responses) => {
        expect(responses.length).toBe(2)
        expect(responses[0].value).toBe('one')
        expect(responses[1].value).toBe('two')
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should retry based on the response', (done) => {
    const store = createStore()
    let triedOnce = false
    nock(URL)
      .get('/')
      .reply((uri, body) => {
        if (triedOnce) {
          return [200]
        } else {
          triedOnce = true
          return [202]
        }
      })

    const action = fetch({
      url: URL,
      retry: (response) => response.status !== 200,
      next: (error, response) => {
        expect(triedOnce).toBeTruthy()
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should allow retrying with an async function', (done) => {
    const store = createStore()
    let triedOnce = false
    nock(URL)
      .get('/')
      .reply((uri, body) => {
        if (triedOnce) {
          return [200]
        } else {
          triedOnce = true
          return [202]
        }
      })

    const action = fetch({
      url: URL,
      retry: (response) => {
        return new Promise((resolve, reject) => {
          if (response.status !== 200) {
            setTimeout(() => resolve(true), 10)
          } else {
            resolve(false)
          }
        })
      },
      next: (error, response) => {
        expect(triedOnce).toBeTruthy()
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should dispatch a fetchError if the arity of `next` is < 2', async () => {
    const store = createStore()
    nock(URL)
      .get('/')
      .reply(400, 'ERROR')

    const action = fetch({
      url: URL,
      next (response) {
        throw new Error('Should not be executed')
      }
    })

    const actionResult = store.dispatch(action)
    await actionResult[1]
    expect(store.getActions()).toHaveLength(3) // inc, dec, and fetch error
  })

  it('should not dispatch a fetchError if the arity of `next` is >= 2', (done) => {
    const store = createStore()
    nock(URL).get('/').reply(400, 'ERROR')

    const action = fetch({
      url: URL,
      next (error, response) {
        if (!error) {
          done('Expected error')
        }
      }
    })

    const actionResult = store.dispatch(action)
    Promise.resolve(actionResult[1])

    // let the actions finish
    setTimeout(() => {
      expect(store.getActions()).toMatchSnapshot() // no fetch error action
      done()
    }, 100)
  })

  describe('abort', () => {
    it('should not call next on a aborted fetch', (done) => {
      const type = 'TEST'
      const id = getID()
      const store = createStore()

      nock(URL)
        .get('/')
        .delay(1)
        .reply(200, 'Done')

      const action = fetch({
        type,
        id,
        url: URL,
        next: () => done('Should not be called')
      })

      store.dispatch(action)
      store.dispatch(abortFetch({type, id}))

      setTimeout(() => {
        expect(store.getActions()).toContainEqual({
          type: ABORTED_FETCH,
          payload: {type, id}
        })
        done()
      }, 2)
    })

    it('should call next if fetch finishes before abort', (done) => {
      const type = 'TEST'
      const id = getID()
      const store = createStore()

      nock(URL)
        .get('/')
        .reply(200, 'done')

      const next = jest.fn()
      store.dispatch(fetch({
        id,
        type,
        url: URL,
        next: () => {
          next()
        }
      }))

      setTimeout(() => {
        store.dispatch(abortFetch({type, id}))
        expect(store.getActions()).toContainEqual({
          type: ABORT_FETCH_FAILED,
          payload: {type, id}
        })
        expect(next).toHaveBeenCalled()
        done()
      }, 2)
    })

    it('should cancel all active fetches of any type', (done) => {
      const store = createStore()

      nock(URL)
        .get('/')
        .delay(1)
        .reply(200, 'done')

      const fetchNum = 10
      for (let i = 0; i < fetchNum; i++) {
        store.dispatch(fetch({
          type: `test-${i}`,
          url: URL,
          next: () => done('should not be called')
        }))
      }

      store.dispatch(abortAllFetches())
      expect(store.getActions()).toHaveLength(fetchNum * 3)
      done()
    })

    it('should abort active fetches of the same type', (done) => {
      const store = createStore()
      const type = 'TEST'
      const fetchNum = 10
      const ids = []

      for (let i = 0; i < fetchNum; i++) {
        nock(URL)
          .get(`/item/${i}`)
          .delay(1)
          .reply(200, 'done')

        const id = getID()
        ids.push(id)

        store.dispatch(fetch({
          type,
          id,
          url: `${URL}/item/${i}`,
          next: () => {
            // should be called once
            done()
          }
        }))
      }

      for (let i = 0; i < (fetchNum - 1); i++) {
        expect(store.getActions()).toContainEqual({
          type: ABORTED_FETCH,
          payload: {type, id: ids[i]}
        })
      }
    })
  })
})
