import { PrismaUserCreator } from '../../src/lib/test-data/prisma'
import { test, expect } from '../fixtures/registration-fixture'

test.describe('Registration', () => {
  test('shows success notification when registering a new account', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder 
  }) => {
    const testUser = await userBuilder.build()
    await registrationHelper.registerNewUser(testUser)

    await expect(registerPage.page.getByText('Account created successfully!')).toBeVisible()
    await expect(registerPage.page).toHaveURL('/login')

    await test.step('cleanup', async () => {
      await new PrismaUserCreator().delete(testUser.email)
    })
  }),

  test('shows error when name is only 1 character', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder 
  }) => {
    const testUser = await userBuilder
      .withName('A')  // Set name to single character
      .build()
    
    await registrationHelper.registerNewUser(testUser)

    await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(registerPage.page).toHaveURL('/register') // Should stay on register page
  }),

  test('shows error when email format is invalid', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder 
  }) => {
    const testUser = await userBuilder
      .withEmail('not-an-email')  // Set invalid email format
      .build()
    
    await registrationHelper.registerNewUser(testUser)

    await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()
    await expect(registerPage.page).toHaveURL('/register')
  }),

  test('shows error when password is only 5 characters', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder 
  }) => {
    const testUser = await userBuilder
      .withPassword('12345')  // Set 5-character password
      .build()
    
    await registrationHelper.registerNewUser(testUser)

    await expect(registerPage.page.getByText('Password must be at least 8 characters')).toBeVisible()
    await expect(registerPage.page).toHaveURL('/register')
  }),

  test('shows both name and email errors when password is valid', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder 
  }) => {
    const testUser = await userBuilder
      .withName('A')  // Invalid name (too short)
      .withEmail('not-an-email')  // Invalid email format
      .build()
    
    await registrationHelper.registerNewUser(testUser)

    // Check that both error messages are visible
    await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()
    await expect(registerPage.page).toHaveURL('/register')
  }),

  test('makes no API calls when validation fails', async ({ 
    registrationHelper, 
    registerPage,
    userBuilder,
    page 
  }) => {
    // Set up API route listener
    let apiCallMade = false;
    await page.route('**/api/auth/register', async route => {
      apiCallMade = true;
      await route.fulfill({ status: 200 });
    });

    const testUser = await userBuilder
      .withName('A')  // Invalid name (too short)
      .withEmail('not-an-email')  // Invalid email format
      .build()
    
    await registrationHelper.registerNewUser(testUser)

    // Verify validation errors are shown
    await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()
    
    // Verify no API call was made
    expect(apiCallMade).toBe(false)
  }),

  test('has correct login link text and path', async ({ registerPage }) => {
    await registerPage.goto()  // Navigate to register page first
    
    const loginLink = registerPage.page.getByText('Already have an account? Sign in')
    
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/login')
  })
})