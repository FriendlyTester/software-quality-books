import { faker } from '@faker-js/faker'

import type { BookModel } from '../models'

import { TestDataBuilder } from './base-builder'

export class BookBuilder extends TestDataBuilder<BookModel> {
  protected data: BookModel

  constructor() {
    super()
    this.data = {
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
    }
  }

  static aBook(): BookBuilder {
    return new BookBuilder()
  }

  withTitle(title: string): this {
    return this.with('title', title)
  }

  withDescription(description: string): this {
    return this.with('description', description)
  }

  withUserId(userId: string): this {
    return this.with('userId', userId)
  }

  build(): BookModel {
    return { ...this.data }
  }
}
