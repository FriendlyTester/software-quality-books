import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'

import Home from '@/app/page'

vi.mock('next-auth/react', () => ({ useSession: vi.fn() }))

describe('Home book creation links', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
  })

  it.each(['unauthenticated', 'loading'] as const)(
    'hides creation links when the session is %s',
    async (status) => {
      vi.mocked(useSession).mockReturnValue({ data: null, status, update: vi.fn() })

      render(<Home />)

      await screen.findByText('No books found.')
      expect(screen.queryByRole('link', { name: 'Add New Book' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Add the first book' })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View All Books' })).toBeInTheDocument()
    }
  )

  it('shows creation links when signed in', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { email: 'reader@example.com' }, expires: '2099-01-01' },
      status: 'authenticated',
      update: vi.fn()
    })

    render(<Home />)

    expect(await screen.findByRole('link', { name: 'Add New Book' })).toHaveAttribute('href', '/books/new')
    expect(screen.getByRole('link', { name: 'Add the first book' })).toHaveAttribute('href', '/books/new')
  })
})