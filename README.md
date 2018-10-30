# woonerf

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

> React/Redux bootstrapping and common libs for Conveyal.

Modern JavaScript applications take a lot of bootstrapping. This library helps with some common libs to include and use on the client to help.

## Table of Contents

* [Pronunciation](#pronuncation)
* [Usage](#usage)
* [API](#api)
  * [Auth0](#auth0)
  * [fetch](#fetch)
  * [fetchMultiple](#fetchmultiple)
  * [html](#html)
  * [message](#message)
* [Install](#install)
* [See Also](#see-also)
* [License](#license)

## Pronunciation

"Woonerf" is a Dutch word for a small neighborhood street where vehicles must move very slowly. The kind of road you can imagine allowing kids to play in. Although it's fun to pronounce it as "woo nerf", the break is after the n (woon == living, erf == yard). A good transliteration for an American English speaker would be "Vone Airf".

## Usage

Let's create a Redux application:

```js
const mount = require('@conveyal/woonerf/mount')

const Application = require('./containers/application')
const reducers = require('./reducers')

mount({
  app: Application,
  id: 'root',
  reducers
})
```

This will create a redux store with the `fetch`, `history`, `logger`, `multi`, and `promise` middleware applied, wrap your application with a redux provider, initialize the browser history, and mount your component to `#id`. The component passed as `app` will be passed `history` from [react-router-redux](https://github.com/reactjs/react-router-redux) and the initialized redux `store` as props.

## API

### auth0

#### Login Component

Create a simple login component with custom [Auth0-lock options](https://auth0.com/docs/libraries/lock/v10/customization).

```js
import Auth0 from '@conveyal/woonerf/components/auth0-lock'

export default function Login () {
  const lockOptions = {}
  return (
    <Auth0
      lockOptions={lockOptions}
      />
  )
}
```

#### Authentication helpers

##### refreshUser

Refresh a user.  To be used within a redux connected component.  Will send update actions to a redux store based on response from Auth0.

```js
import {refreshUser} from '@conveyal/woonerf/auth0'

...

function mapDispatchToProps (dispatch) {
  return {
    refreshUserToken: () => refreshUser(dispatch)
  }
}

...
```

### fetch

`fetch({url, options, next, retry, type, id})`

Create a fetch action to be dispatched by the store. Key features:

* Automatically `JSON.stringify` bodies that are objects and automatically `JSON.parse` responses that are `application/json`.
* `next` is a function that's result will be dispatched by the store. It can be an `async` function.
* `retry` is a function that receives the response and needs to resolve to a Boolean. It can be an `async` function.
* `Authorization`, `Content-Type` and `Accept` headers are added automatically (if you want to make a request
   without one of these headers, for instance suppressing the Authorization header when calling a
   remote service, simply set it to null in the `headers` field of `options`).
* `type` is a string that can designate a category of fetches that will only run one at a time.
* `id` can be used to later abort the specific fetch by dispatching an `abortFetch` action.

#### fetch errors

The arity of `next` determines how errors are handled.

1. When no `next` is present, a `fetchError` action is dispatched.
2. When a `next` function with arity < 2 is present, then on error `fetchError` is dispatched and `next` is not called.
3. When `next` has an arity >= 2 then errors are passed to `next` and `fetchError` is *not* dispatched.

```js
const fetch = require('@conveyal/woonerf/fetch')

store.dispatch(fetch({
  url: 'http://conveyal.com',
  options: {
    method: 'post',
    body: {hello: 'world'}
  },
  retry: async (response) => {
    if (response.status !== 200) {
      await timeout(2000)
      return true
    } else {
      return false
    }
  },
  next: async (error, response) => {
    return actionBasedOn(response)
  }
}))
```

#### abort fetch

Abort a fetch by dispatching `abortFetch({type, id})`.

```js
const fetch, {abortFetch, getID} = require('@conveyal/woonerf/fetch')
const id = getID()
store.dispatch(fetch({
  url: 'http://conveyal.com',
  id,
  next: () => {
    throw new Error('Will not be called')
  }
}))
store.dispatch(abortFetch({id}))
```

### fetchMultiple

`fetchMultiple({fetches, next})`

Allows you to dispatch a single action that will call next with all of the responses.

```js
const {fetchMultiple} = require('@conveyal/woonerf/fetch')

store.dispatch(fetchMultiple({
  fetches: [{
    url: 'http://conveyal.com',
    options: {
      body: {hello: 'world'}
    }
  }],
  next: async (error, responses) => {
    return actionBasedOn(response)
  }
}))
```

### html

`html({staticHost, title})`

Used for creating the default HTML needed to use a woonerf application.  Accepts the following parameters:

* `staticHost`: (optional) The host server of the static files.  This gets prepended to an expected assets folder for the static files.  The files loaded will be: `${staticHost}assets/favicon.ico`, `${staticHost}assets/index.css` and `${staticHost}assets/index.js`.  If omitted, the host path will be an empty string.
* `title`: The string to insert into the `title` tag.

### message

`message(key, defaultMessage, parameters)`

Pass a key, an optional default message, and an optional parameters object that will replace corresponding `%(key)`. It auto-parses `process.env.MESSAGES` brought in by [`mastarm`](https://github.com/conveyal/mastarm) and allows you to set your own messages directly with `setMessages`. Message lookup is done with [`lodash/get`](https://lodash.com/docs/#get) for nested objects.

```js
import message, {setMessages} from '@conveyal/woonerf/message'

setMessages({one:'hello world', two:'hola %(s)', three: {four: 'wat'}})

message('key.doesnt.exist', 'default message') // 'default message'
message('one', 'default message') // 'hello world'
message('three.four', 'default message') // 'wat'
message('fake.key', 'hello %(world)s', {world: 'bob'}) // 'hello bob'
message('two', 'hello %(s)', {s: 'bob'}) // 'hola bob'
message('fake.key', 'hello %(a) %(b)', {a: 'bob', b: 'tim'}) // 'hello bob tim'
```

## Install

With [yarn](https://yarnpkg.com/) installed, run

```sh
$ yarn add @conveyal/woonerf
```

## See Also

- [conveyal/mastarm](https://github.com/conveyal/mastarm)
- [facebook/react](https://github.com/facebook/react)
- [reactjs/redux](https://github.com/reactjs/redux)
- [woonerf](https://en.wikipedia.org/wiki/Woonerf)

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@conveyal/woonerf.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/@conveyal/woonerf
[travis-image]: https://img.shields.io/travis/conveyal/woonerf.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/woonerf
