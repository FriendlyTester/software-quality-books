import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

import NewBookPage from '@/app/books/new/page'
import { authConfig } from '@/lib/auth'

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authConfig: {} }))
jest.mock('@/components/BookForm', () => ({
  __esModule: true,
  default: function MockBookForm() {
    return <form aria-label="Add Book Form" />
  }
}))

describe('NewBookPage authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('redirects signed-out visitors to login with a return URL', async () => {
    jest.mocked(getServerSession).mockResolvedValue(null)

    await expect(NewBookPage()).rejects.toThrow('NEXT_REDIRECT')

    expect(getServerSession).toHaveBeenCalledWith(authConfig)
    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=/books/new')
  })

  it('renders the book form for signed-in visitors', async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } })

    render(await NewBookPage())

    expect(screen.getByRole('form', { name: 'Add Book Form' })).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})