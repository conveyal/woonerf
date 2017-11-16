// @flow
import html from '../../src/html'

describe('html', () => {
  it('should return an HTML string with a given title', () => {
    const title = 'Unique Title'
    const str = html({title})
    expect(str.indexOf(title) !== -1).toBeTruthy()
    expect(str).toMatchSnapshot()
  })

  it('should return an HTML string with a given staticHost', () => {
    const staticHost = 'https://fakehost.com/'
    const title = 'Unique Title'
    const str = html({staticHost, title})
    expect(str.indexOf(staticHost) !== -1).toBeTruthy()
    expect(str).toMatchSnapshot()
  })
})
