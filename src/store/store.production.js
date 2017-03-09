import {browserHistory} from 'react-router'
import {routerMiddleware} from 'react-router-redux'
import {applyMiddleware, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'

import {middleware as fetch} from '../fetch'
import multi from './multi'
import promise from './promise'

export default function configureStore (rootReducer, initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      routerMiddleware(browserHistory),
      fetch,
      multi,
      promise,
      thunkMiddleware
    )
  )
}
