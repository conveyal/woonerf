import fetch from 'isomorphic-fetch'
import isObject from 'lodash.isobject'
import {createAction} from 'redux-actions'

export const INCREMENT_FETCH = 'increment outstanding fetches'
export const DECREMENT_FETCH = 'decrement outstanding fetches'
export const FETCH = 'fetch'
export const FETCH_MULTIPLE = 'fetch multiple'
export const FETCH_ERROR = 'fetch error'

export const incrementFetches = createAction(INCREMENT_FETCH)
export const decrementFetches = createAction(DECREMENT_FETCH)
export const fetchAction = createAction(FETCH)
export const fetchMultiple = createAction(FETCH_MULTIPLE)
export const fetchError = createAction(FETCH_ERROR)

export function middleware (store) {
  return (next) => (action) => {
    if (action.type === FETCH) {
      return store.dispatch(runFetchAction(action.payload, store.getState()))
    } else if (action.type === FETCH_MULTIPLE) {
      return store.dispatch(runFetchMultiple(action.payload, store.getState()))
    } else {
      return next(action)
    }
  }
}

export default fetchAction

/**
 * Calls fetch, adds Auth and Content header if needed. Automatically parses content based on type.
 *
 * @returns Promise
 */

function runFetch ({
  options = {},
  retry = false,
  url
}, state) {
  const isJSON = isObject(options.body)
  return fetch(url, {
    ...options,
    body: isJSON ? JSON.stringify(options.body) : options.body,
    headers: {
      ...createAuthorizationHeader(state),
      ...createContentHeader(isJSON),
      ...(options.headers || {})
    }
  })
    .then(checkStatus)
    .then(createResponse)
    .then(async (response) =>
      (retry && await retry(response))
        ? runFetch({options, retry, url}, state)
        : response)
}

function runFetchAction ({
  next,
  options = {},
  retry = false,
  url
}, state) {
  return [
    incrementFetches(),
    runFetch({options, retry, url}, state)
      .then((response) => [decrementFetches(), next(null, response)])
      .catch((error) =>
        createErrorResponse(error)
          .then((response) => [decrementFetches(), fetchError(response), next(error, response)]))
  ]
}

/**
 * @returns Promise
 */

function runFetchMultiple ({
  fetches,
  next
}, state) {
  return [
    incrementFetches(),
    Promise.all(fetches.map((fetch) => runFetch(fetch, state)))
      .then((responses) => [decrementFetches(), next(null, responses)])
      .catch((error) =>
        createErrorResponse(error)
          .then((response) => [decrementFetches(), fetchError(response), next(error, response)]))
  ]
}

function createAuthorizationHeader (state) {
  return state.user && state.user.idToken
    ? {Authorization: `bearer ${state.user.idToken}`}
    : {}
}

function checkStatus (res) {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    throw res
  }
}

function createContentHeader (isJSON) {
  return isJSON
    ? {'Accept': 'application/json', 'Content-Type': 'application/json;charset=UTF-8'}
    : {}
}

function createErrorResponse (res) {
  return res.headers
    ? createResponse(res)
    : Promise.resolve(res)
}

function createResponse (res) {
  return deserialize(res)
    .then((value) => ({
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      value
    }))
    .catch((err) => ({
      value: err
    }))
}

function deserialize (res) {
  const header = [res.headers.get('Content-Type'), res.headers.get('Content')].filter(Boolean)
  for (let i = 0; i < header.length; i++) {
    if (header[i].indexOf('application/json') > -1) return res.json()
    if (header[i].indexOf('application/ld+json') > -1) return res.json()
    if (header[i].indexOf('application/octet-stream') > -1) return res.arrayBuffer()
  }
  return res.text()
}
