// app/books/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Book } from '@/types/book'
import { useSession } from 'next-auth/react'
import ReviewForm from '@/components/ReviewForm'
import DeleteBookButton from '@/components/DeleteBookButton'

interface Review {
  id: string
  content: string
  rating: number
  createdAt: string
  user: {
    id: string
    profile: {
      name: string | null
    }
    email: string | null
  }
}

interface BookState {
  book: Book | null
  reviews: Review[]
  isLoading: boolean
  error: string | null
}

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [state, setState] = useState<BookState>({
    book: null,
    reviews: [],
    isLoading: true,
    error: null
  })
  // Helper to get user id safely
  const getUserId = () => (session?.user && (session.user as { id?: string }).id) ?? undefined

  const fetchData = async () => {
    try {
      const [bookRes, reviewsRes] = await Promise.all([
        fetch(`/api/books/${id}`),
        fetch(`/api/books/${id}/reviews`)
      ])

      if (!bookRes.ok) throw new Error('Failed to fetch book')
      if (!reviewsRes.ok) throw new Error('Failed to fetch reviews')
      
      const book = await bookRes.json()
      const reviews = await reviewsRes.json()
      
      setState({ 
        book, 
        reviews, 
        isLoading: false, 
        error: null 
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred'
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }))
    }
  }

  const hasUserReviewed = state.reviews.some(review => 
  review.user?.id === getUserId()
  )

  useEffect(() => {
    fetchData()
  }, [id])

  if (state.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {state.error}
        </div>
      </div>
    )
  }

  if (!state.book) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Book not found</h1>
      </div>
    )
  }

  const isOwner = getUserId() === state.book?.userId

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Link 
            href="/books"
            className="text-blue-500 hover:underline"
          >
            ← Back to Books
          </Link>
          {isOwner && (
            <div className="space-x-2">
              <Link
                href={`/books/${id}/edit`}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Edit
              </Link>
              <DeleteBookButton bookId={id} />
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4" data-testid='book-title'>{state.book.title}</h1>
          <p className="text-gray-600 whitespace-pre-wrap" data-testid='book-description'>{state.book.description}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          
          {session ? (
            hasUserReviewed ? (
              <p className="text-gray-600 italic mb-8">
                You have already reviewed this book
              </p>
            ) : (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Add a Review</h3>
                <ReviewForm 
                  bookId={id} 
                  onReviewAdded={fetchData}
                />
              </div>
            )
          ) : (
            <p className="mb-8">
              <Link href="/login" className="text-blue-500 hover:underline">
                Sign in
              </Link>
              {' '}to leave a review
            </p>
          )}

          <div className="space-y-6">
            {state.reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">
                    {review.user.profile?.name || 'Anonymous'}
                  </div>
                  <div className="text-yellow-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-gray-600">{review.content}</p>
                <div className="text-sm text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            
            {state.reviews.length === 0 && (
              <p className="text-gray-500 text-center">
                No reviews yet. Be the first to review this book!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}