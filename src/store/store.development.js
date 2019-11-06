import {browserHistory} from 'react-router'
import {routerMiddleware} from 'react-router-redux'
import {applyMiddleware, compose, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import {middleware as fetch} from '../fetch'

import multi from './multi'
import promise from './promise'

const logger = createLogger({
  collapsed: true,
  duration: true
})

const middlewares = [
  routerMiddleware(browserHistory),
  fetch,
  multi,
  promise,
  thunkMiddleware,
  logger
]

if (process.env.LOGROCKET) {
  const LogRocket = require('logrocket')
  middlewares.push(LogRocket.reduxMiddleware())
}
// Use Redux Dev Tools to compose enhancers if available.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export default function configureStore (rootReducer, initialState) {
  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}
