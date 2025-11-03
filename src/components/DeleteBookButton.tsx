'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useNotificationStore } from '@/lib/store/notification'

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const showNotification = useNotificationStore(state => state.showNotification)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete book')
      }

      showNotification('Book deleted successfully!', 'success')
      router.push('/books')
      router.refresh()
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Failed to delete book',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300"
      aria-label="Delete book"
    >
      {loading ? 'Deleting...' : 'Delete Book'}
    </button>
  )
} 