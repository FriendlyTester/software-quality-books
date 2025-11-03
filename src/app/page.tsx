'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Book } from '@/types/book'

interface HomeState {
  books: Book[]
  isLoading: boolean
  error: string | null
}

export default function Home() {
  const [state, setState] = useState<HomeState>({
    books: [],
    isLoading: true,
    error: null
  })

  useEffect(() => {
    fetch(`/api/books?t=${Date.now()}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.text()
          console.error('Response:', res.status, errorData)
          throw new Error(errorData || 'Failed to fetch books')
        }
        return res.json()
      })
      .then(books => setState({ 
        books, 
        isLoading: false, 
        error: null 
      }))
      .catch(error => {
        console.error('Error:', error)
        setState({ 
          books: [], 
          isLoading: false, 
          error: error.message 
        })
      })
  }, [])

  if (state.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Software Quality Books</h1>
        <div>Loading...</div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Software Quality Books</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Error: {state.error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Software Quality Books</h1>
        <div className="space-x-4">
          <Link 
            href="/books" 
            className="text-blue-500 hover:underline"
          >
            View All Books
          </Link>
          <Link 
            href="/books/new" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Book
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.books.map((book) => (
          <div key={book.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/books/${book.id}`} className="hover:text-blue-500">
                  {book.title}
                </Link>
              </h2>
              <p className="text-gray-600 line-clamp-3 mb-4">
                {book.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  {new Date(book.createdAt).toLocaleDateString()}
                </span>
                <Link 
                  href={`/books/${book.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.books.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No books found.</p>
          <Link href="/books/new" className="text-blue-500 hover:underline">
            Add the first book
          </Link>
        </div>
      )}
    </div>
  )
}
