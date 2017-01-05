/* globals describe, expect, it */

import React from 'react'
import {Provider} from 'react-redux'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import Auth0 from '../../../src/components/auth0-lock'

function getProfile (token, callback) {
  if (token === 'ok-token') {
    callback(null, { profileData: 'blah' })
  } else {
    callback('error')
  }
}

describe('auth0-lock', () => {
  it('should show lock and handle successful authentication', () => {
    window.localStorage = {
      setItem: () => null
    }

    const lock = {
      getProfile: getProfile,
      on: (evt, callback) => callback({ idToken: 'ok-token' }),
      show: () => null
    }
    const mockStore = configureStore()({})

    // mount component
    renderer.create(
      <Provider store={mockStore}>
        <Auth0
          lock={lock}
          />
      </Provider>
    )

    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('should show lock and handle unsuccessful authentication', () => {
    window.localStorage = {
      setItem: () => null
    }

    const lock = {
      getProfile: getProfile,
      on: (evt, callback) => callback({ idToken: 'not-ok-token' }),
      show: () => null
    }
    const mockStore = configureStore()({})

    // mount component
    renderer.create(
      <Provider store={mockStore}>
        <Auth0
          lock={lock}
          />
      </Provider>
    )

    expect(mockStore.getActions()).toMatchSnapshot()
  })
})
