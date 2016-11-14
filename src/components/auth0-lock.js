import {PropTypes} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {lock, setAuth0User} from '../auth0'
import Pure from './pure'

const localStorage = window.localStorage

class Auth0 extends Pure {
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
