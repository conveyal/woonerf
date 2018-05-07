// @flow
import isObject from 'lodash/isObject'
if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

export const INCREMENT_FETCH = 'increment outstanding fetches'
export const DECREMENT_FETCH = 'decrement outstanding fetches'
export const FETCH = 'fetch'
export const FETCH_MULTIPLE = 'fetch multiple'
export const FETCH_ERROR = 'fetch error'

const createAction = (type) => (payload) => ({type, payload})

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
export function runFetch ({
  options = {},
  retry = false,
  url
}, state) {
  const headers = {
    ...createAuthorizationHeader(state),
    ...createContentHeader(options.body),
    ...(options.headers || {})
  }

  const filteredHeaders = {}

  // allow removing generated headers by specifiying { header: null } in options.headers
  // do this in two steps because otherwise we're modifying the object as we're iterating over it
  Object.keys(headers)
    .filter(key => headers[key] !== null && headers[key] !== undefined)
    .forEach(key => { filteredHeaders[key] = headers[key] })

  return fetch(url, {
    ...options,
    body: serialize(options.body),
    headers: filteredHeaders
  })
    .then(checkStatus)
    .then(createResponse)
    .then(async (response) =>
      (retry && await retry(response))
        ? runFetch({options, retry, url}, state)
        : response)
}

export function runFetchAction ({
  next,
  options = {},
  retry = false,
  url
}, state) {
  const dispatchFetchError = !next || next.length < 2
  const wrappedNext = wrapNext(next)

  return [
    incrementFetches({options, url}),
    runFetch({options, retry, url}, state)
      .then((response) => [decrementFetches({options, url}), wrappedNext(null, response)])
      .catch((error) =>
        createErrorResponse(error)
          .then((response) => {
            const actions = [decrementFetches({options, url}), wrappedNext(error, response)]
            if (dispatchFetchError) actions.push(fetchError(response))
            return actions
          }))
  ]
}

/**
 * @returns Promise
 */
export function runFetchMultiple ({
  fetches,
  next
}, state) {
  const dispatchFetchError = !next || next.length < 2
  const wrappedNext = wrapNext(next)

  return [
    ...fetches.map(({options, url}) => incrementFetches({options, url})),
    Promise.all(fetches.map((fetch) => runFetch(fetch, state)))
      .then((responses) => [
        ...fetches.map(({options, url}) => decrementFetches({options, url})),
        wrappedNext(null, responses)
      ])
      .catch((error) =>
        createErrorResponse(error)
          .then((response) => {
            const actions = fetches.map(({options, url}) => decrementFetches({options, url}))
            if (dispatchFetchError) actions.push(fetchError(response))
            return [...actions, wrappedNext(error, response)]
          }))
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

function createContentHeader (body) {
  if (body instanceof window.FormData) {
    return {}
  } else if (isObject(body)) {
    return {'Accept': 'application/json', 'Content-Type': 'application/json;charset=UTF-8'}
  } else {
    return {}
  }
}

function createErrorResponse (res) {
  return res.headers
    ? createResponse(res)
    : Promise.resolve(res)
}

function createResponse (res) {
  return deserialize(res)
    .then((value) => ({
      ...res,
      value
    }))
    .catch((err) => ({
      ...res,
      value: err
    }))
}

function deserialize (res) {
  const header = `${res.headers.get('Content-Type')} ${res.headers.get('Content')}`
  if (header.indexOf('json') > -1) return res.json()
  if (header.indexOf('octet-stream') > -1) return res.arrayBuffer()
  if (header.indexOf('text') > -1) return res.text()
}

function serialize (body) {
  if (body instanceof window.FormData) {
    return body
  } else if (isObject(body)) {
    return JSON.stringify(body)
  } else {
    return body
  }
}

function wrapNext (next) {
  return function (error, response) {
    if (next) {
      if (next.length > 1) {
        return next(error, response)
      } else if (!error) {
        return next(response)
      }
    }
  }
}
