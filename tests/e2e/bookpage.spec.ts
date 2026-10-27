import { expect } from '@playwright/test'

import { test } from '../fixtures/bookpage-fixture'
import { UserBuilder } from '../../src/lib/test-data'
import { PrismaBookCreator, PrismaUserCreator, type PrismaBook } from '../../src/lib/test-data/prisma'


test.describe('Book page data', () => {
  // Configure tests to run serially
  test.describe.configure({ mode: 'serial' })
  
  const userCreator = new PrismaUserCreator()
  const bookCreator = new PrismaBookCreator()
  let testBook: PrismaBook

  test.beforeAll(async ({ bookBuilder }) => {
    const owner = await userCreator.create(UserBuilder.aUser().build())
    testBook = await bookCreator.create(bookBuilder.withUserId(owner.id).build())
  })

  test.afterAll(async () => {
    await bookCreator.delete(testBook.id)
    if (testBook.user?.email) {
      await userCreator.delete(testBook.user.email)
    }
  })


  test('should display book with correct title', async ({ bookPage }) => {
    await bookPage.goto(testBook.id)
    const bookTitle = await bookPage.getBookTitle()
    expect(bookTitle).toBe(testBook.title)
  })

  test('should display book with correct description', async ({ bookPage }) => {
    await bookPage.goto(testBook.id)
    const bookDescription = await bookPage.getBookDescription()
    expect(bookDescription).toBe(testBook.description)
  })
})