
export const reducers = {
  'log out' (state, action) {
    return {}
  },
  'set auth0 user' (state, action) {
    return {
      ...state,
      ...action.payload
    }
  },
  'set id token' (state, action) {
    return {
      ...state,
      idToken: action.payload
    }
  }
}

const localStorageAvailable = typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined' &&
  typeof window.localStorage.getItem === 'function'

export const initialState = {
  ...JSON.parse(localStorageAvailable ? window.localStorage.getItem('user') : '{}')
}
