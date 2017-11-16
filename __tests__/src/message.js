// @flow
import message, {setMessages} from '../../src/message'

describe('message', () => {
  const DEFAULT_MESSAGE = 'default message'
  const FAKE_KEY = 'key-doesnt-exist'
  setMessages({
    default: DEFAULT_MESSAGE,
    one: 'hello world',
    two: 'hola %(s)',
    three: {
      four: 'wat'
    }
  })

  it('should return the correct message', () => {
    expect(message('default')).toBe(DEFAULT_MESSAGE)
  })

  it('should return the passed in message if the key does not exist', () => {
    expect(message(FAKE_KEY, DEFAULT_MESSAGE)).toBe(DEFAULT_MESSAGE)
  })

  it('should return the defined message if the key exists', () => {
    expect(message('one', DEFAULT_MESSAGE)).toBe('hello world')
  })

  it('should look up the defined message properly on a nested object', () => {
    expect(message('three.four', DEFAULT_MESSAGE)).toBe('wat')
  })

  it('should interpolate correctly using JavaScript template style', () => {
    expect(message(FAKE_KEY, 'hello %(world)', {world: 'bob'})).toBe('hello bob')
    expect(message('two', {s: 'bobby'})).toBe('hola bobby')
    expect(message('two', 'hello %(s)', {s: 'bob'})).toBe('hola bob')
    expect(message(FAKE_KEY, 'hello %(name1) %(name2)', {
      name1: 'bob',
      name2: 'tim'
    })).toBe('hello bob tim')
  })
})
