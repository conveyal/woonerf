import Auth0Lock from 'auth0-lock'
import Auth0Client from 'auth0-js'
import {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import {createAction} from 'redux-actions'

const {AUTH0_CLIENT_ID, AUTH0_DOMAIN} = process.env
const localStorage = window.localStorage

export const setAuth0User = createAction('set auth0 user')
export const authIsRequired = AUTH0_CLIENT_ID && AUTH0_DOMAIN
export const lock = authIsRequired
  ? new Auth0Lock(
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN, {
      auth: {
        params: {
          scope: 'openid analyst offline_access'
        },
        redirect: false
      },
      closeable: false,
      autoclose: true
    })
  : null
export const client = authIsRequired
  ? new Auth0Client({
    clientID: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN
  })
  : null

/**
 * Use on application mount when authentication is required
 */
export function refreshUser (dispatch) {
  if (authIsRequired) {
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
  }
}

class Auth0 extends Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    setAuth0User: PropTypes.func.isRequired
  }

  _authenticated = (authResult) => {
    const {push, setAuth0User} = this.props
    lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        setAuth0User(null)
        push('/login')
      } else {
        const user = {
          ...authResult,
          profile
        }
        localStorage.setItem('user', JSON.stringify(user))
        setAuth0User(user)
        push('/')
      }
    })
  }

  componentDidMount () {
    // when testing, auth0 credentials are not currently entered, so `lock` will be null
    if (lock) {
      lock.show()
      lock.on('authenticated', this._authenticated)
    }
  }

  render () {
    return null
  }
}

function mapStateToProps (state) {
  return state
}
const mapDispatchToProps = {
  push,
  setAuth0User
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth0)
