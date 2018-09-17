// @flow
import debug from 'debug'
import get from 'lodash/get'

const dbg = debug('woonerf:message')

/**
 * Expose a Set of all the keys used
 */
export const KeysUsed = new Set()

/**
 * Set the messages object
 */
export function setMessages (newMessages) {
  messages = newMessages
}

let messages = {}
if (process.env.MESSAGES) {
  setMessages(JSON.parse(process.env.MESSAGES))
}

/**
 * Requires a key, defaultMessage and parameters are optional
 */
export default function getMessage (key: string, defaultMessage?: string | Object, parameters?: Object): string {
  if (defaultMessage == null) {
    defaultMessage = ''
    parameters = {}
  } else if (typeof defaultMessage === 'object') {
    parameters = defaultMessage
    defaultMessage = ''
  }

  // Store the used key
  KeysUsed.add(key)

  // Get the message with "lodash/get" to allow nested keys ('noun.action' => {noun: {action: 'value'}})
  const msg = get(messages, key, defaultMessage)
  const result = parameters ? replaceMessage(msg, parameters) : msg
  dbg(key, result)
  return result
}

function replaceMessage (msg, data) {
  return msg.replace(
    new RegExp('%\\((' + Object.keys(data).join('|') + ')\\)', 'g'),
    (m, key) => data.hasOwnProperty(key) ? data[key] : m
  )
}
