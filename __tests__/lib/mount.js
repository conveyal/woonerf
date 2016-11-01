/* globals describe, it, expect */

import React, {Component, PropTypes} from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import {create} from '../../lib/mount'

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
    const tree = mount(create({app: App, reducers: {}}))
    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
