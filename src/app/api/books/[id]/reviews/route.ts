import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

import prisma from '@/lib/db'
import { authConfig } from '@/lib/auth'

// Create a validation schema for reviews
const ReviewSchema = z.object({
  content: z.string()
    .min(1, 'Review content is required')
    .max(1000, 'Review content must be less than 1000 characters'),
  rating: z.coerce.number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const reviews = await prisma.review.findMany({
      where: {
        bookId: id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
  const session = await getServerSession(authConfig)
      const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
      if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const book = await prisma.book.findUnique({ where: { id } })

    if (!user || !book) {
      return NextResponse.json(
        { error: 'Unable to submit review because the book or user was not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = ReviewSchema.parse(body)

    const review = await prisma.review.create({
      data: {
        content: validatedData.content,
        rating: validatedData.rating,
        bookId: id,
  userId: userId
      },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Failed to create review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
  { error: error.issues[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error details:', {
        code: error.code,
        meta: error.meta
      })

      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'You have already reviewed this book' },
          { status: 400 }
        )
      }

      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Unable to submit review because the book or user no longer exists' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
} 