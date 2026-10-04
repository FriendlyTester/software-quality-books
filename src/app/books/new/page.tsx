import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

import BookForm from '@/components/BookForm'
import { authConfig } from '@/lib/auth'

export default async function NewBookPage() {
  const session = await getServerSession(authConfig)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    redirect('/login?callbackUrl=/books/new')
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
      <BookForm />
    </div>
  )
} 