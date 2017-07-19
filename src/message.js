// @flow
import debug from 'debug'
import kebabCase from 'lodash/kebabCase'
import {sprintf} from 'sprintf-js'

const dbg = debug('woonerf:message')

let messages = {}
if (process.env.MESSAGES) {
  setMessages(JSON.parse(process.env.MESSAGES))
}

export default function getMessage (defaultMessage: string, slug: void | string, ...args): string {
  const key = slug || kebabCase(defaultMessage)
  const msg = messages[key] || defaultMessage
  const result = args ? sprintf(msg, ...args) : msg
  dbg(key, result)
  return result
}

export function setMessages (newMessages) {
  messages = newMessages
}
