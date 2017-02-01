import Auth0Lock from 'auth0-lock'
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
