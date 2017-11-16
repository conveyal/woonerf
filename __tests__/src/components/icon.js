// @flow
import React from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import {Icon} from '../../../src'

describe('Icon', () => {
  it('should return an Icon element with a given type', () => {
    expect(mountToJson(mount(<Icon type='woonerf' />))).toMatchSnapshot()
  })
})
