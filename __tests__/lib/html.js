/* globals describe, expect, it */

import html from '../../lib/html'

describe('html', () => {
  it('should return an HTML string with a given title', () => {
    const title = 'Unique Title'
    const str = html({title})
    expect(str.indexOf(title) !== -1).toBeTruthy()
    expect(str).toMatchSnapshot()
  })
})
