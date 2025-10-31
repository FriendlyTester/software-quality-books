// app/api/books/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authConfig } from '@/lib/auth'
import { BookSchema } from '@/lib/validations/book'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig)

  const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json();
    // Validate the input
    const validatedData = BookSchema.parse(body);
    const book = await prisma.book.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        userId: userId
      }
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}