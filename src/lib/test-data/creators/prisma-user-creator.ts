import type { PrismaClient, Profile, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import defaultPrisma from '../../db'
import type { UserModel } from '../models'

import type { Creator } from './types'

// password is the raw (unhashed) password so tests can log in as this user
export type CreatedUser = User & { profile: Profile | null }

export class PrismaUserCreator implements Creator<UserModel, CreatedUser> {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async create(model: UserModel): Promise<CreatedUser> {
    const user = await this.prisma.user.create({
      data: {
        id: model.id,
        email: model.email,
        password: await bcrypt.hash(model.password, 10),
        role: model.role,
        profile: {
          create: { name: model.name },
        },
      },
      include: { profile: true },
    })

    return { ...user, password: model.password }
  }

  async delete(email: string) {
    await this.prisma.user.delete({ where: { email } })
  }
}
