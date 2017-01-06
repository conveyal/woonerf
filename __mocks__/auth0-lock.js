export default function Auth0Lock (clientID, domain, options) {
  this.options = options
}

Auth0Lock.prototype.getProfile = function (token, callback) {
  if (token === 'ok-token') {
    callback(null, { profileData: 'blah' })
  } else {
    callback('error')
  }
}

Auth0Lock.prototype.on = function (event, callback) {
  callback({ idToken: this.options.fakeAuthenticatedToken })
}

Auth0Lock.prototype.show = function () {}
