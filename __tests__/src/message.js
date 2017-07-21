
import message, {setMessages} from '../../src/message'

describe('message', () => {
  const AUTO_SLUGGED_MESSAGE = 's-l$U/g*g.e d'
  const DEFAULT_MESSAGE = 'default message'
  setMessages({
    one: 'hello world',
    two: 'hola %s',
    three: {
      four: 'wat'
    },
    's-l-u-g-g-e-d': 'cool'
  })

  it('should return the default message', () => {
    expect(message(DEFAULT_MESSAGE)).toBe(DEFAULT_MESSAGE)
  })

  it('should return the default message if the key does not exist', () => {
    expect(message(DEFAULT_MESSAGE, 'key-doesnt-exist')).toBe(DEFAULT_MESSAGE)
  })

  it('should return the defined message if the key exists', () => {
    expect(message(DEFAULT_MESSAGE, 'one')).toBe('hello world')
  })

  it('should look up the defined message properly using lodash/get', () => {
    expect(message(DEFAULT_MESSAGE, 'three.four')).toBe('wat')
  })

  it('should create a slug out of the message to be automatically looked up', () => {
    expect(message(AUTO_SLUGGED_MESSAGE)).toBe('cool')
  })

  it('should interpolate correctly using sprintf', () => {
    expect(message('hello %(world)s', null, {world: 'bob'})).toBe('hello bob')
    expect(message('hello %s', 'two', 'bob')).toBe('hola bob')
    expect(message('hello %s %s', null, 'bob', 'tim')).toBe('hello bob tim')
  })
})
