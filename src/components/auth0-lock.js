import {PropTypes} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {lock as defaultLock, setAuth0User} from '../auth0'
import Pure from './pure'

class Auth0 extends Pure {
  static propTypes = {
    lock: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    setAuth0User: PropTypes.func.isRequired
  }

  _authenticated = (authResult) => {
    const {lock, push, setAuth0User} = this.props
    lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        setAuth0User(null)
        push('/login')
      } else {
        const user = {
          ...authResult,
          profile
        }
        window.localStorage.setItem('user', JSON.stringify(user))
        setAuth0User(user)
        push('/')
      }
    })
  }

  componentDidMount () {
    // when testing, auth0 credentials are not currently entered, so `lock` will be null
    const {lock} = this.props
    if (lock) {
      lock.show()
      lock.on('authenticated', this._authenticated)
    }
  }

  render () {
    return null
  }
}

function mapStateToProps (state, props) {
  return {
    lock: props.lock ? props.lock : defaultLock
  }
}
const mapDispatchToProps = {
  push,
  setAuth0User
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth0)
