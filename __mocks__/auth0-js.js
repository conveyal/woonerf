export default function Auth0 () {}

Auth0.version = 'mock'
Auth0.clientInfo = { name: 'auth0.js', version: Auth0.version }

Auth0.prototype.refreshToken = function (token, callback) {
  if (token === 'token-that-produces-error') {
    callback('an error')
  } else {
    callback(null, { id_token: 'fake-token' })
  }
}
