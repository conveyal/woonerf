// @flow
import nock from 'nock'

import fetch, {fetchMultiple} from '../../src/fetch'
import createStore from '../../src/store'

const store = createStore()

describe('fetch', () => {
  it('should dispatch a fetch action and call next', (done) => {
    nock('http://google.com')
      .get('/')
      .reply(200, {})

    const action = fetch({
      url: 'http://google.com',
      next: done
    })
    store.dispatch(action)
  })

  it('should automatically serialize json bodies', (done) => {
    const body = {
      data: 'important'
    }

    nock('http://google.com')
      .post('/', body)
      .reply(200, 'good')

    const action = fetch({
      url: 'http://google.com',
      options: {
        method: 'post',
        body
      },
      next: (error, response) => {
        expect(response.value).toEqual('good')
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should work with FormData', (done) => {
    const data = new window.FormData()
    data.append('name', 'world')

    nock('http://google.com')
      .post('/')
      .reply(200, 'FormData')

    const action = fetch({
      url: 'http://google.com',
      options: {
        method: 'post',
        body: data
      },
      next: (error, response) => {
        expect(response.value).toEqual('FormData')
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should automatically parse json responses', (done) => {
    nock('http://google.com')
      .get('/')
      .reply(200, {hello: 'world'})

    const action = fetch({
      url: 'http://google.com',
      next: (error, response) => {
        expect(response.value).toEqual({hello: 'world'})
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should fetch multiple urls in one go', (done) => {
    nock('http://conveyal.com')
      .get('/one')
      .reply(200, 'one')

    nock('http://conveyal.com')
      .get('/two')
      .reply(200, 'two')

    const action = fetchMultiple({
      fetches: [{
        url: 'http://conveyal.com/one'
      }, {
        url: 'http://conveyal.com/two'
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
    let triedOnce = false
    nock('http://conveyal.com')
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
      url: 'http://conveyal.com',
      retry: (response) => response.status !== 200,
      next: (error) => {
        expect(triedOnce).toBeTruthy()
        done(error)
      }
    })

    store.dispatch(action)
  })

  it('should allow retrying with an async function', (done) => {
    let triedOnce = false
    nock('http://conveyal.com')
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
      url: 'http://conveyal.com',
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
})
