/* globals describe, expect, it, jasmine, jest */

import isObject from 'lodash.isobject'

import fetch from '../../src/fetch'
import createStore from '../../src/store'

const store = createStore()

jasmine.DEFAULT_TIMEOUT_INTERVAL *= 5

describe('fetch', () => {
  it('should dispatch a fetch action and call next', async () => {
    const action = fetch({
      url: 'http://google.com',
      next: jest.fn()
    })
    await store.dispatch(action)
    expect(action.payload.next).toBeCalled()
  })

  it('should automatically parse json responses', async () => {
    const action = fetch({
      url: 'https://autocomplete.clearbit.com/v1/companies/suggest?query=stripe',
      options: {
        headers: {
          'Accept': 'application/json'
        }
      },
      next: (response) => {
        expect(isObject(response.value)).toBeTruthy()
      }
    })
    await store.dispatch(action)
  })
})
