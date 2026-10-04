import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import BookForm from '@/components/BookForm'
import { useNotificationStore } from '@/lib/store/notification'

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }))

describe('BookForm validation', () => {
  const originalFetch = global.fetch
  const push = jest.fn()
  const refresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useRouter).mockReturnValue({ push, refresh } as unknown as ReturnType<typeof useRouter>)
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    useNotificationStore.setState({ message: null, type: null })
  })

  afterEach(() => {
    global.fetch = originalFetch
    useNotificationStore.setState({ message: null, type: null })
  })

  it.each(['', ' \t '])('shows accessible field errors for a blank title %j and description', (title) => {
    render(<BookForm />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: title } })
    fireEvent.submit(screen.getByRole('form', { name: 'Add Book Form' }))

    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Title')).toHaveAccessibleDescription('Title is required')
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription('Description is required')
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(useNotificationStore.getState().message).toBeNull()
    expect(screen.getByRole('button', { name: 'Add Book' })).toBeEnabled()
    expect(screen.queryByText(/"origin"|"code"|"path"/)).not.toBeInTheDocument()
  })

  it('shows only the invalid field error', () => {
    render(<BookForm />)
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Valid description' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Add Book Form' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
    expect(screen.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByLabelText('Description')).not.toHaveAttribute('aria-describedby')
  })

  it('clears field errors and submits normalized data after correction', async () => {
    render(<BookForm />)
    const form = screen.getByRole('form', { name: 'Add Book Form' })
    fireEvent.submit(form)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Valid Title  ' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Valid description' } })
    fireEvent.submit(form)

    await waitFor(() => expect(push).toHaveBeenCalledWith('/books'))
    expect(global.fetch).toHaveBeenCalledWith('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Valid Title', description: 'Valid description' })
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'false')
    expect(refresh).toHaveBeenCalled()
    expect(useNotificationStore.getState().message).toBe('Book added successfully!')
  })

  it('keeps API errors in the notification flow', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to save book' })
    })
    render(<BookForm initialData={{ title: 'Valid title', description: 'Valid description' }} />)
    fireEvent.submit(screen.getByRole('form', { name: 'Add Book Form' }))

    await waitFor(() => expect(useNotificationStore.getState().message).toBe('Failed to save book'))
    expect(useNotificationStore.getState().type).toBe('error')
    expect(push).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('preserves the edit method and return URL', async () => {
    render(<BookForm
      isEditing={true}
      initialData={{ id: 'book-1', title: 'Valid title', description: 'Valid description' }}
      returnUrl="/books/book-1"
    />)
    fireEvent.submit(screen.getByRole('form', { name: 'Edit Book Form' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/books/book-1'))
    expect(global.fetch).toHaveBeenCalledWith('/api/books/book-1', expect.objectContaining({ method: 'PUT' }))
    expect(useNotificationStore.getState().message).toBe('Book updated successfully!')
  })
})