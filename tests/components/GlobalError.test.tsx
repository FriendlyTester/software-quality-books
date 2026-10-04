import { renderToStaticMarkup } from 'react-dom/server'

import GlobalError from '@/app/global-error'

jest.mock('react-dom/server', () => jest.requireActual('react-dom/server.node'))

describe('GlobalError', () => {
  const error = Object.assign(new Error('Sensitive database connection details'), {
    digest: 'internal-error-digest'
  })

  function renderErrorDocument() {
    const markup = renderToStaticMarkup(<GlobalError error={error} />)
    return new DOMParser().parseFromString(markup, 'text/html')
  }

  it('provides standalone recovery links without application providers', () => {
    const errorDocument = renderErrorDocument()

    expect(errorDocument.querySelector('main a')?.getAttribute('href')).toBe('/books')
    expect(errorDocument.querySelector('main a')?.textContent).toBe('Back to Books')
    expect(errorDocument.querySelector('header a')?.getAttribute('href')).toBe('/')
    expect(errorDocument.querySelector('header a')?.textContent).toBe('Software Quality Books')
  })

  it('renders its own document and generic error message', () => {
    const errorDocument = renderErrorDocument()

    expect(errorDocument.documentElement.lang).toBe('en')
    expect(errorDocument.title).toBe('Something went wrong | Software Quality Books')
    expect(errorDocument.querySelector('h1')?.textContent).toBe('Something went wrong')
    expect(errorDocument.body.getAttribute('style')).toContain('background:#ffffff')
  })

  it('does not expose error messages, stack traces, or internal identifiers', () => {
    const markup = renderToStaticMarkup(<GlobalError error={error} />)

    expect(markup).not.toContain(error.message)
    expect(markup).not.toContain(error.stack)
    expect(markup).not.toContain(error.digest)
  })
})