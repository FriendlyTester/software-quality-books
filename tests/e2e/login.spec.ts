import { test } from '../fixtures/login-fixture'
import { expect } from '@playwright/test'
import { UserBuilder } from '../data-builders/user-builder'

test.describe('Login Validation', () => {

  test('should show both validation messages when fields are empty', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.clickSignIn()
    await expect(loginPage.page.getByText('Invalid email address'), 'Checking email error message is displayed').toBeVisible()
    await expect(loginPage.page.getByText('Password is required'), 'Checking password error message is displayed').toBeVisible()
  })

  test('should show only password validation when email is filled', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.fillEmail('test@example.com')
    await loginPage.clickSignIn()
    await expect(loginPage.page.getByText('Password is required'), 'Checking password error message is displayed').toBeVisible()
  })

  test('should show only email validation when password is filled', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.fillPassword('password123')
    await loginPage.clickSignIn()
    await expect(loginPage.page.getByText('Invalid email address'), 'Checking email error message is displayed').toBeVisible()
  })
  
  test('should successfully login with valid credentials', async ({ loginPage }) => {
    // Create a test user directly in the database
    const testUser = await new UserBuilder().create();

    // Perform login
    await loginPage.goto();
    await loginPage.fillEmail(testUser.email);
    await loginPage.fillPassword(testUser.password);
    await loginPage.clickSignIn();

    // Verify redirect to books page
    await expect(loginPage.page, 'Checking we have moved to the books page').toHaveURL('/books');

    await UserBuilder.delete(testUser.email);
  })
}) 