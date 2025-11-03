import { expect } from '@playwright/test'

import { test } from '../fixtures/homepage-fixture'
import { UserBuilder } from '../data-builders/user-builder'
import { AuthHelper } from '../helpers/auth.helper'

test.describe('Homepage', () => {
  test('should show add book button when user is logged in', async ({ homePage, page }) => {
    // Create and login test user
    const authHelper = new AuthHelper(page);
    const testUser = await authHelper.loginUser()

    // Navigate to homepage
    await homePage.goto()
    
    // Verify add book button is visible
    const addBookButton = await homePage.getAddBookButton()
    await expect(addBookButton).toBeVisible()

    // Cleanup
    await UserBuilder.delete(testUser.email)
  })

  test('should navigate to login page when clicking Sign In button', async ({ homePage }) => {
    await homePage.goto()
    await homePage.clickSignIn()
    await expect(homePage.page).toHaveURL('/login')
    await expect(homePage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
    await expect(homePage.page.getByLabel('Email')).toBeVisible()
    await expect(homePage.page.getByLabel('Password')).toBeVisible()
    await expect(homePage.page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })
})