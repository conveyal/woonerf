// @flow
import merge from 'lodash/merge'
import {combineReducers} from 'redux'
import {routerReducer as routing} from 'react-router-redux'

let configureStore = null
if (process.env.NODE_ENV === 'production') {
  configureStore = require('./store.production')
} else if (process.env.NODE_ENV === 'test') {
  configureStore = require('./store.mock')
} else {
  configureStore = require('./store.development')
}

export default function createStore (reducers) {
  const configuredState = safeParse(process.env.STORE)
  const locallyStoredState = safeParse(window.localStorage ? window.localStorage.getItem('state') : {})
  const store = configureStore(
    combineReducers({routing, ...reducers}),
    merge(configuredState, locallyStoredState)
  )
  return store
}

function safeParse (str) {
  try {
    return JSON.parse(str) || {}
  } catch (e) {
    return {}
  }
}
