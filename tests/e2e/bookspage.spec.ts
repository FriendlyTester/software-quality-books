import { expect } from '@playwright/test'
import { Book } from '@prisma/client'

import { test } from '../fixtures/bookspage-fixture'
import { UserBuilder } from '../data-builders/user-builder'
import { BookBuilder } from '../data-builders/book-builder'


test.describe('Books Page', () => {
  // Configure tests to run serially
  test.describe.configure({ mode: 'serial' })
  
  let testBook: Book & { 
    user: { 
      id: string
      email: string
      password: string
      createdAt: Date
      updatedAt: Date
    } | null 
  }

  test.beforeAll(async ({ bookBuilder }) => {
    testBook = await bookBuilder
      .create()
  })

  test.afterAll(async () => {
    await BookBuilder.delete(testBook.id)
    if (testBook.user?.email) {
      await UserBuilder.delete(testBook.user.email)
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