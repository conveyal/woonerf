# woonerf

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

> React/Redux bootstrapping and common libs for Conveyal.

Modern JavaScript applications take a lot of bootstrapping. This library helps with some common libs to include and use on the client to help.

## Usage

Let's create a Redux application:

```js
const {mount} = require('@conveyal/reboot')

const Application = require('./containers/application')
const reducers = require('./reducers')

mount({
  app: Application,
  id: 'root',
  reducers
})
```

This will create a redux store with the `fetch`, `history`, `logger`, `multi`, and `promise` middleware applied, wrap your application with a redux provider, initialize the browser history, and mount your component to `#id`.

## API

### `auth0`

### `fetch({url, options, next})`

### `html({title})`

### `mount({app, id, reducers})`

## Install

With [yarn](https://yarnpkg.com/) installed, run

```
$ yarn add @conveyal/reboot
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
