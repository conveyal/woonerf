// @flow
import nock from 'nock'

import fetch, {fetchMultiple} from '../../src/fetch'
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
      next: done
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
      next: (error) => {
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
      next: (error) => {
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
    expect(store.getActions()).toMatchSnapshot() // with fetch error action
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
})
