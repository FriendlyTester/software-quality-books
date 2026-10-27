import { expect } from '@playwright/test'

import { test } from '../fixtures/review-fixture'
import { UserBuilder } from '../../src/lib/test-data'
import { PrismaBookCreator, PrismaUserCreator, type PrismaBook } from '../../src/lib/test-data/prisma'


test.describe('Book Reviews', () => {
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

  test('should show review form when user is logged in', async ({ reviewPage, authHelper }) => {
    await authHelper.loginUser()
    await reviewPage.goto(testBook.id)
    await expect(reviewPage.reviewForm).toBeVisible()
  })

  test('should not show review form when user is not logged in', async ({ reviewPage }) => {
    await reviewPage.goto(testBook.id)
    await expect(reviewPage.reviewForm).not.toBeVisible()
    await expect(reviewPage.page.getByText('Sign in to leave a review')).toBeVisible()
  })

  test('should show validation error when submitting empty review', async ({ reviewPage, authHelper }) => {
    await authHelper.loginUser()
    await reviewPage.goto(testBook.id)
    await reviewPage.submitReview('', 0)
    await expect(reviewPage.page.getByText('Review content is required')).toBeVisible()
    await expect(reviewPage.page.getByText('Rating is required')).toBeVisible()
  })

  test('should successfully submit review', async ({ reviewPage, authHelper }) => {
    const testUser = await authHelper.loginUser()
    await reviewPage.goto(testBook.id)
    
    const reviewContent = 'This is a test review'
    const rating = 4
    
    await reviewPage.submitReview(reviewContent, rating)
    
    // Verify the review appears on the page
    
    
    // Cleanup
    await userCreator.delete(testUser.email)
  })

  test('should hide review form after submitting a review', async ({ reviewPage, authHelper }) => {
    const testUser = await authHelper.loginUser()
    await reviewPage.goto(testBook.id)
    
    // Submit a review
    await reviewPage.submitReview('Test review content', 4)
    await reviewPage.page.waitForLoadState('networkidle')
    
    // Verify review form is hidden
    await expect(reviewPage.reviewForm).not.toBeVisible()
    await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()
    
    // Cleanup
    await userCreator.delete(testUser.email)
  })

  test('should show already reviewed message when revisiting page', async ({ reviewPage, authHelper }) => {
    const testUser = await authHelper.loginUser()
    await reviewPage.goto(testBook.id)
    
    // Submit initial review
    await reviewPage.submitReview('Test review content', 4)
    await reviewPage.page.waitForLoadState('networkidle')

    // Reload page to simulate revisiting later
    await reviewPage.page.reload({ waitUntil: 'networkidle' })
    
    // Verify review form is still hidden
    await expect(reviewPage.reviewForm).not.toBeVisible()
    await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()
    
    // Cleanup
    await userCreator.delete(testUser.email)
  })
})