// @flow
import React from 'react'
import {Provider} from 'react-redux'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import Auth0 from '../../../src/components/auth0-lock'

describe('auth0-lock', () => {
  it('should show lock and handle successful authentication', () => {
    window.localStorage = {
      setItem: () => null
    }

    const mockStore = configureStore()({})

    // mount component
    renderer.create(
      <Provider store={mockStore}>
        <Auth0
          lockOptions={{ fakeAuthenticatedToken: 'ok-token' }}
          />
      </Provider>
    )

    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('should show lock and handle unsuccessful authentication', () => {
    window.localStorage = {
      setItem: () => null
    }

    const mockStore = configureStore()({})

    // mount component
    renderer.create(
      <Provider store={mockStore}>
        <Auth0
          lockOptions={{ fakeAuthenticatedToken: 'bad-token' }}
          />
      </Provider>
    )

    expect(mockStore.getActions()).toMatchSnapshot()
  })
})
