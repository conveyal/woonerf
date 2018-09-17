// @flow
import React, {Component} from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import {create} from '../../src/mount'

class App extends Component {
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
