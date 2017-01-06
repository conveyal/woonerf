import Auth0Lock from 'auth0-lock'
import Auth0Client from 'auth0-js'
import {push} from 'react-router-redux'
import {createAction} from 'redux-actions'

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN

export const setAuth0User = createAction('set auth0 user')
export const authIsRequired = AUTH0_CLIENT_ID && AUTH0_DOMAIN
export const defaultLockOptions = {
  auth: {
    params: {
      scope: 'openid analyst offline_access'
    },
    redirect: false
  },
  closeable: false,
  autoclose: true
}
export const getLock = (lockOptions) => new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, lockOptions)
export const getClient = () => new Auth0Client({
  clientID: AUTH0_CLIENT_ID,
  domain: AUTH0_DOMAIN
})

/**
 * Use on application mount when authentication is required
 */
export function refreshUser (dispatch, overrideAuthIsRequired) {
  const localStorage = window.localStorage
  if (authIsRequired || overrideAuthIsRequired) {
    const client = getClient()
    const userString = localStorage.getItem('user')
    const user = userString && JSON.parse(userString)
    if (user && user.refreshToken) {
      dispatch(setAuth0User(user))
      if (process.env.NODE_ENV !== 'development') {
        client.refreshToken(user.refreshToken, function (err, delegationResult) {
          if (err) {
            dispatch(setAuth0User(null))
            localStorage.setItem('user', null)
            dispatch(push('/login'))
          } else {
            user.idToken = delegationResult.id_token
            dispatch(setAuth0User(user))
            localStorage.setItem('user', JSON.stringify(user))
          }
        })
      }
    } else {
      dispatch(push('/login'))
    }
  } else {
    throw new Error('Auth0 credentials not found!')
  }
}
