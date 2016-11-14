/* globals describe, expect, it, jest */

import promise from '../../../src/store/promise'

describe('store > promise', () => {
  it('should call dispatch on the resolved value of a promise', async () => {
    const store = {
      dispatch: jest.fn()
    }
    const next = jest.fn()
    const action = {type: 'ACTION', payload: true}
    await promise(store)(next)(new Promise((resolve) => resolve(action)))
    expect(store.dispatch).toBeCalledWith(action)
    expect(next).not.toBeCalled()
  })

  it('should not call dispatch if the element is not a promise', () => {
    const store = {
      dispatch: jest.fn()
    }
    const next = jest.fn()
    const action = {type: 'ACTION', payload: true}
    promise(store)(next)(action)
    expect(store.dispatch).not.toBeCalled()
    expect(next).toBeCalledWith(action)
  })
})
