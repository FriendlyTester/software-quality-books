'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { BookSchema } from '@/lib/validations/book'
import { useNotificationStore } from '@/lib/store/notification'

interface BookFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
  }
  isEditing?: boolean
  returnUrl?: string
}

export default function BookForm({ initialData, isEditing, returnUrl = '/books' }: BookFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const showNotification = useNotificationStore(state => state.showNotification)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description')
    }

    try {
      const validatedData = BookSchema.parse(data)
      
      const url = isEditing ? `/api/books/${initialData?.id}` : '/api/books'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save book')
      }

      showNotification(
        isEditing ? 'Book updated successfully!' : 'Book added successfully!',
        'success'
      )
  router.push(returnUrl as Parameters<typeof router.push>[0])
      router.refresh()
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      noValidate={true}
      className="space-y-4"
      aria-label={isEditing ? 'Edit Book Form' : 'Add Book Form'}
      role="form"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium" id="title-label">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required={true}
          defaultValue={initialData?.title}
          className="w-full px-3 py-2 border rounded-lg"
          aria-labelledby="title-label"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium" id="description-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required={true}
          rows={5}
          defaultValue={initialData?.description}
          className="w-full px-3 py-2 border rounded-lg"
          aria-labelledby="description-label"
          aria-required="true"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
        aria-busy={loading}
        aria-label={loading ? 'Saving book' : isEditing ? 'Update Book' : 'Add Book'}
      >
        {loading ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  )
} 