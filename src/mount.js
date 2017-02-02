import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'

import createStore from './store'

if (process.env.NODE_ENV === 'development') {
  const Perf = window.Perf = require('react-addons-perf')
  Perf.start()
}

export function create ({
  app,
  reducers
}) {
  const store = createStore(reducers)
  const history = syncHistoryWithStore(browserHistory, store)
  return React.createElement(Provider, {store},
    React.createElement(app, {history, store}))
}

export default function mount ({
  app,
  id = 'root',
  reducers
}) {
  return render(
    create({app, reducers}),
    document.getElementById(id)
  )
}
