
import message, {setMessages} from '../../src/message'

describe('message', () => {
  const AUTO_SLUGGED_MESSAGE = 's-l$U/g*g.e d'
  const DEFAULT_MESSAGE = 'default message'
  setMessages({one: 'hello world', two: 'hola %s', 's-l-u-g-g-e-d': 'cool'})

  it('should work consistently', () => {
    expect(message(DEFAULT_MESSAGE)).toBe(DEFAULT_MESSAGE)
    expect(message(DEFAULT_MESSAGE, 'slug-doesnt-exist')).toBe(DEFAULT_MESSAGE)
    expect(message(DEFAULT_MESSAGE, 'one')).toBe('hello world')
    expect(message(AUTO_SLUGGED_MESSAGE)).toBe('cool')
    expect(message('hello %(world)s', null, {world: 'bob'})).toBe('hello bob')
    expect(message('hello %s', 'two', 'bob')).toBe('hola bob')
    expect(message('hello %s %s', null, 'bob', 'tim')).toBe('hello bob tim')
  })
})
