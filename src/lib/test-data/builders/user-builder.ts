import { faker } from '@faker-js/faker'

import type { UserModel } from '../models'

import { TestDataBuilder } from './base-builder'

export class UserBuilder extends TestDataBuilder<UserModel> {
  protected data: UserModel

  constructor() {
    super()
    this.data = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      role: 'USER',
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

  withName(name: string): this {
    return this.with('name', name)
  }

  asAdmin(): this {
    return this.with('role', 'ADMIN')
  }

  build(): UserModel {
    return { ...this.data }
  }
}
