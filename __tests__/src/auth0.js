/* globals describe, expect, it, jest */

import {getLock, refreshUser, setAuth0User} from '../../src/auth0'

describe('auth0', () => {
  it('getLock should work', () => {
    getLock()
  })

  describe('refreshUser', () => {
    it('should work when no user is present in localStorage', () => {
      window.localStorage = {
        getItem: () => null
      }
      const dispatch = jest.fn()
      refreshUser(dispatch, true)
      expect(dispatch.mock.calls).toMatchSnapshot()
    })

    it('should throw error when no credentials supplied', () => {
      const dispatch = jest.fn()
      expect(() => refreshUser(dispatch)).toThrowErrorMatchingSnapshot()
    })

    describe('when a user is present in localStorage', () => {
      it('should handle token that produces Auth0 error', () => {
        window.localStorage = {
          getItem: () => JSON.stringify({
            refreshToken: 'token-that-produces-error'
          }),
          setItem: () => null
        }
        const dispatch = jest.fn()
        refreshUser(dispatch, true)
        expect(dispatch.mock.calls).toMatchSnapshot()
      })

      it('should handle ok token', () => {
        window.localStorage = {
          getItem: () => JSON.stringify({
            refreshToken: 'ok-token'
          }),
          setItem: () => null
        }
        const dispatch = jest.fn()
        refreshUser(dispatch, true)
        expect(dispatch.mock.calls).toMatchSnapshot()
      })
    })
  })

  it('setAuth0User should work', () => {
    expect(setAuth0User({ user: 'a user' })).toMatchSnapshot()
  })
})
