// Plain models produced by the builders. They are deliberately independent of Prisma
// so they can be sent over HTTP (ApiBookCreator) or persisted directly (PrismaBookCreator).

export type BookModel = {
  id: string
  title: string
  description: string
  userId?: string
}

export type UserRole = 'USER' | 'ADMIN'

export type UserModel = {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}
