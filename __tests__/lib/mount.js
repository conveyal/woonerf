/* globals describe, it, expect */

import React, {Component, PropTypes} from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

class App extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  render () {
    return <div />
  }
}

describe('mount', () => {
  it('should mount the react application to root', () => {
    process.env.NODE_ENV = 'test'
    const create = require('../../lib/mount').create
    const tree = mount(create({app: App, reducers: {}}))
    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
