import Link from 'next/link'

import { Book } from '@/types/book'
import { generateTestId, TEST_DATA_IDS } from '@/utils/idHelpers';

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden" 
      data-testid={generateTestId(TEST_DATA_IDS.BOOK_CARD, book.title)}
    >
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
          <span data-testid = 'date-created'>
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
  )
} 