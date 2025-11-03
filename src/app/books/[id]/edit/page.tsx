import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

import BookForm from '@/components/BookForm'
import prisma from '@/lib/db'
import { authConfig } from '@/lib/auth'


export default async function EditBookPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authConfig);
    const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
    const book = await prisma.book.findUnique({
    where: { id }
  })

  if (!book) {
    notFound()
  }

  // Redirect if not the owner
    if (book.userId !== userId) {
    redirect('/books')
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
      <BookForm 
        initialData={book}
        isEditing={true}
        returnUrl={`/books/${id}`}
      />
    </div>
  )
} 