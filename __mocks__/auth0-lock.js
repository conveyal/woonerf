export default function Auth0Lock (clientID, domain, options) {
  this.options = options
}

Auth0Lock.prototype.getProfile = function (token, callback) {
  if (token === 'ok-token') {
    callback(null, { profileData: 'blah' })
  } else {
    callback(new Error('error obtaining Auth0 profile'))
  }
}

Auth0Lock.prototype.hide = function () {}

Auth0Lock.prototype.on = function (event, next) {
  next({ idToken: this.options.fakeAuthenticatedToken })
}

Auth0Lock.prototype.show = function () {}
