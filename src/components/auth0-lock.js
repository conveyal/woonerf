import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {setAuth0User} from '../actions/user'
import {defaultLockOptions, getLock} from '../auth0'
import Pure from './pure'

class Auth0 extends Pure {
  static propTypes = {
    lockOptions: PropTypes.object,
    push: PropTypes.func.isRequired,
    setAuth0User: PropTypes.func.isRequired
  }

  componentDidMount () {
    const {lockOptions, push, setAuth0User} = this.props
    const lock = getLock(lockOptions)
    lock.show()
    lock.on('authenticated', (authResult) => {
      lock.hide()
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
    })
  }

  render () {
    return null
  }
}

function mapStateToProps (state, props) {
  return {
    lockOptions: props.lockOptions || defaultLockOptions
  }
}
const mapDispatchToProps = {
  push,
  setAuth0User
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth0)
