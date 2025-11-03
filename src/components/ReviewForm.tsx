'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  bookId: string
  onReviewAdded?: () => void
}

interface ValidationErrors {
  content?: string
  rating?: string
}

export default function ReviewForm({ bookId, onReviewAdded }: ReviewFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (!content.trim()) {
      errors.content = 'Review content is required'
    }
    
    if (!rating) {
      errors.rating = 'Rating is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          rating: Number(rating)
        })
      })

  const data = await res.json()

      if (!res.ok) {
        if (res.status === 400) {
          setValidationErrors({
            [data.error.includes('content') ? 'content' : 
              data.error.includes('rating') ? 'rating' : 'general']: data.error
          })
          return
        }
        throw new Error(data.error || 'Failed to submit review')
      }

      // Reset form
      setContent('')
      setRating('')
      
      if (onReviewAdded) {
        onReviewAdded()
      }
      
      router.refresh()
    } catch (error: unknown) {
      console.error('Review submission error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred while submitting the review')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={true}>
      {error ? <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div> : null}

      <div>
        <label htmlFor="rating" className="block text-sm font-medium">
          Rating
        </label>
        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select a rating</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} star{num !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
        {validationErrors.rating ? <p className="mt-1 text-sm text-red-500">{validationErrors.rating}</p> : null}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Review
        </label>
        <textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Write your review here..."
        />
        {validationErrors.content ? <p className="mt-1 text-sm text-red-500">{validationErrors.content}</p> : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
} 