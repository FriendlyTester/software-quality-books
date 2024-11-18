import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'
import { TestDataBuilder } from './base.builder'
import prisma from '../../src/lib/db'
import bcrypt from 'bcrypt'

// Define required fields that must be present for every user
export type TestUser = {
  id: string
  email: string
  password: string
  name: string
}

export class UserBuilder extends TestDataBuilder<TestUser> {
  protected data: TestUser

  constructor() {
    super()
    this.data = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
       name: faker.person.fullName()
    }
  }

  static aUser(): UserBuilder {
    return new UserBuilder()
  }

  withEmail(email: string): this {
    return this.with('email', email)
  }

  withPassword(password: string): this {
    return this.with('password', password)
  }

  // Factory method to create in database
  async create() {
    const hashedPassword = await bcrypt.hash(this.data.password, 10)
    
    return await prisma.user.create({
      data: {
        id: this.data.id,
        email: this.data.email,
        password: hashedPassword,
        profile: {
            create: {
              name: this.data.name,
            }
          }
      },
      include: {
        profile: true
      }
    })
  }

  // Factory method to delete from database
  static async delete(email: string) {
    await prisma.user.delete({
      where: { email }
    })
  }

  build(): TestUser {
    return this.data
  }
}