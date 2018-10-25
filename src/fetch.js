// @flow
import get from 'lodash/get'
import isObject from 'lodash/isObject'
if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

// ID that gets incremented for each fetch
let FETCH_ID = 0

// Get's the next fetch ID, which can be passed in to `fetch`, and allows for
// tracking the fetch or aborting it.
export const getID = () => ++FETCH_ID

// Active fetches, can still be aborted
const activeFetches = []

// Remove a fetch from the active array
const removeFetch = (_id) =>
  activeFetches.splice(activeFetches.indexOf(_id), 1)

// Check if a fetch is still active
const isActive = (_id) =>
  activeFetches.includes(_id)

// Action types
export const ABORTED_FETCH = 'aborted fetch'
export const ABORT_FETCH_FAILED = 'abort fetch failed'
export const INCREMENT_FETCH = 'increment outstanding fetches'
export const DECREMENT_FETCH = 'decrement outstanding fetches'
export const FETCH = 'fetch'
export const FETCH_MULTIPLE = 'fetch multiple'
export const FETCH_ERROR = 'fetch error'

// Simple action creator
const createAction = (type) => (payload) => ({type, payload})

// Actions ready for a payload
export const abortedFetch = createAction(ABORTED_FETCH)
export const abortFetchFailed = createAction(ABORT_FETCH_FAILED)
export const fetchAction = createAction(FETCH)
export const fetchMultiple = createAction(FETCH_MULTIPLE)
export const fetchError = createAction(FETCH_ERROR)

// Call decrement and dispatch "aborted" and "decrement" actions
export const abortFetch = (_id) => {
  if (isActive(_id)) {
    return [
      abortedFetch(_id),
      decrementFetches(_id)
    ]
  } else {
    return abortFetchFailed(_id)
  }
}

// Abort all active fetches
export const abortAllFetches = () =>
  activeFetches.map(_id => abortFetch(_id))

// Send an increment action and add the _id to active
export const incrementFetches = (payload) => {
  activeFetches.push(payload._id)

  return {
    type: INCREMENT_FETCH,
    payload
  }
}

// Send a decrement action and remove the _id from active
export const decrementFetches = (_id) => {
  removeFetch(_id)

  return {
    type: DECREMENT_FETCH,
    payload: _id
  }
}

// Redux middleware
export const middleware = (store) => (next) => (action) => {
  switch (get(action, 'type')) {
    case FETCH:
      return store.dispatch(runFetchAction(action.payload, store.getState()))
    case FETCH_MULTIPLE:
      return store.dispatch(runFetchMultiple(action.payload, store.getState()))
    default:
      return next(action)
  }
}

export default fetchAction

/**
 * Calls fetch, adds Auth and Content header if needed. Automatically parses
 * content based on type.
 *
 * @returns Promise
 */
export function runFetch ({
  _id,
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

  // Allow removing generated headers by specifiying { header: null } in
  // options.headers. Do this in two steps because otherwise we're modifying
  // the object as we're iterating over it.
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
      (retry && isActive(_id) && await retry(response))
        ? runFetch({_id, options, retry, url}, state)
        : response)
}

/**
 * Part of Redux action cycle. Returns an array of actions.
 */
export function runFetchAction ({
  _id = getID(),
  next,
  options = {},
  retry = false,
  url
}, state) {
  // If next does not exist or only takes a response, dispatch on error
  const dispatchFetchError = !next || next.length < 2

  // Wrap next so that we can parse the response
  const wrappedNext = wrapNext(next)

  return [
    incrementFetches({_id, options, url}),
    runFetch({_id, options, retry, url}, state)
      .then((response) => {
        if (isActive(_id)) {
          return [
            decrementFetches(_id),
            wrappedNext(null, response)
          ]
        }
      })
      .catch((error) => {
        return createErrorResponse(error)
          .then((response) => {
            if (isActive(_id)) {
              const actions = [
                decrementFetches(_id),
                wrappedNext(error, response)
              ]
              if (dispatchFetchError) actions.push(fetchError(response))
              return actions
            }
          })
      })
  ]
}

/**
 * @returns Array of actions
 */
export function runFetchMultiple ({
  _id = getID(), // One ID for all fetch IDs in a fetch multiple
  fetches,
  next
}, state) {
  const dispatchFetchError = !next || next.length < 2
  const wrappedNext = wrapNext(next)

  return [
    incrementFetches({_id, fetches}),
    Promise.all(fetches.map((fetch) => runFetch({...fetch, _id}, state)))
      .then((responses) => {
        if (isActive(_id)) {
          return [
            decrementFetches(_id),
            wrappedNext(null, responses)
          ]
        }
      })
      .catch((error) =>
        createErrorResponse(error)
          .then((response) => {
            if (isActive(_id)) {
              const actions = [
                decrementFetches(_id),
                wrappedNext(error, response)
              ]
              if (dispatchFetchError) actions.push(fetchError(response))
              return actions
            }
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
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    }
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
    .then((value) => {
      res.value = value
      return res
    })
    .catch((err) => {
      res.value = err
      return res
    })
}

async function deserialize (res) {
  const header =
    `${res.headers.get('Content-Type')} ${res.headers.get('Content')}`
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
