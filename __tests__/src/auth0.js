/* globals describe, expect, it */

import {getLock, setAuth0User} from '../../src/auth0'

describe('auth0', () => {
  it('getLock should work', () => {
    getLock()
  })

  it('setAuth0User should work', () => {
    expect(setAuth0User({ user: 'a user' })).toMatchSnapshot()
  })
})
