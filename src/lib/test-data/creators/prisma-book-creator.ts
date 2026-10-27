import type { Book, PrismaClient, User } from '@prisma/client'

import defaultPrisma from '../../db'
import type { BookModel } from '../models'

import type { Creator } from './types'

export type PrismaBook = Book & { user: User | null }

// Writes books directly to the database. Unlike the API creator, the model is persisted as-is,
// so the book must already have a userId (create the user first with PrismaUserCreator).
export class PrismaBookCreator implements Creator<BookModel, PrismaBook> {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async create(model: BookModel): Promise<PrismaBook> {
    if (!model.userId) {
      throw new Error('PrismaBookCreator requires a book with a userId')
    }
    return this.prisma.book.create({
      data: {
        id: model.id,
        title: model.title,
        description: model.description,
        userId: model.userId,
      },
      include: { user: true },
    })
  }

  async delete(id: string) {
    await this.prisma.book.delete({ where: { id } })
  }

  async deleteAll() {
    await this.prisma.book.deleteMany()
  }

  async findByTitle(title: string) {
    return this.prisma.book.findMany({ where: { title } })
  }
}
