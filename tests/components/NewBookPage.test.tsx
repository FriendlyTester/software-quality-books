import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

import NewBookPage from '@/app/books/new/page'
import { authConfig } from '@/lib/auth'

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authConfig: {} }))
vi.mock('@/components/BookForm', () => ({
  __esModule: true,
  default: function MockBookForm() {
    return <form aria-label="Add Book Form" />
  }
}))

describe('NewBookPage authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('redirects signed-out visitors to login with a return URL', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(NewBookPage()).rejects.toThrow('NEXT_REDIRECT')

    expect(getServerSession).toHaveBeenCalledWith(authConfig)
    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=/books/new')
  })

  it('renders the book form for signed-in visitors', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } })

    render(await NewBookPage())

    expect(screen.getByRole('form', { name: 'Add Book Form' })).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})