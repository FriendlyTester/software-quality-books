// app/books/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { Book } from '@/types/book'
import { BookCard } from '@/components/BookCard'

interface BooksState {
  books: Book[]
  isLoading: boolean
  error: string | null
}

export default function BooksPage() {
  const { data: session } = useSession()
  const [state, setState] = useState<BooksState>({
    books: [],
    isLoading: true,
    error: null
  })

  useEffect(() => {
    fetch('/api/books')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch books')
        return res.json()
      })
      .then(books => setState({ books, isLoading: false, error: null }))
      .catch(error => setState({ 
        books: [], 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }))
  }, [])

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Books</h1>
        {session ? <Link 
            href="/books/new" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Book
          </Link> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {state.books.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No books found.</p>
          {session ? <Link href="/books/new" className="text-blue-500 hover:underline">
              Add the first book
            </Link> : null}
        </div>
      )}
    </div>
  )
}