/* globals describe, expect, it, jest */

import multi from '../../../src/store/multi'

describe('store > multi', () => {
  it('should call dispatch on every action in the array', () => {
    const store = {
      dispatch: jest.fn()
    }
    const next = jest.fn()
    const action1 = {type: 'ACTION1'}
    const action2 = {type: 'ACTION2'}
    const actions = [action1, action2]
    multi(store)(next)(actions)
    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(next).not.toBeCalled()
  })

  it('should not call dispatch if the element is not an array', () => {
    const store = {
      dispatch: jest.fn()
    }
    const next = jest.fn()
    const action = {type: 'ACTION', payload: true}
    multi(store)(next)(action)
    expect(next).toBeCalledWith(action)
    expect(store.dispatch).not.toBeCalled()
  })
})
