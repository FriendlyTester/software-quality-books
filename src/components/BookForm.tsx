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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'title' | 'description', string>>>({})
  const showNotification = useNotificationStore(state => state.showNotification)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description')
    }

    const result = BookSchema.safeParse(data)
    if (!result.success) {
      const errors: Partial<Record<'title' | 'description', string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'title' || field === 'description') {
          errors[field] ??= issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const validatedData = result.data
      
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
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title ? <p id="title-error" role="alert" className="mt-1 text-sm text-red-500">
          {fieldErrors.title}
        </p> : null}
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
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? 'description-error' : undefined}
        />
        {fieldErrors.description ? <p id="description-error" role="alert" className="mt-1 text-sm text-red-500">
          {fieldErrors.description}
        </p> : null}
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