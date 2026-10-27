import { expect } from '@playwright/test'

import { test } from '../fixtures/bookspage-fixture'
import { UserBuilder } from '../../src/lib/test-data'
import { PrismaBookCreator, PrismaUserCreator, type PrismaBook } from '../../src/lib/test-data/prisma'


test.describe('Books Page', () => {
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

  test('should display created book', async ({ booksPage }) => {
    await booksPage.goto()
    await expect(booksPage.getBookCard(testBook.title)).toBeVisible()
  })


  test('should display book with correct title', async ({ booksPage }) => {
    await booksPage.goto()
    const bookTitle = await booksPage.getBookTitle(testBook.title)
    expect(bookTitle).toBe(testBook.title)
  })

  test('should display book with correct created date', async ({ booksPage }) => {
    await booksPage.goto()
    const bookCreatedDate = await booksPage.getBookCreatedDate(testBook.title)
    const expectedDate = new Intl.DateTimeFormat('en-US').format(testBook.createdAt)
    expect(bookCreatedDate).toBe(expectedDate)
  })

})