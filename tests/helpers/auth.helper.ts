// Removed deprecated next-auth/jwt encode import
import { UserBuilder } from '../data-builders/user-builder'
import { Page } from '@playwright/test'

export class AuthHelper {
  constructor(private page: Page) {}

  async loginUser(user?: { id: string; email: string }) {
    // Create test user if not provided
    const testUser = user || await new UserBuilder().create()
    
    // Set a mock session cookie for Auth.js v5
    // In Auth.js v5, session cookies are signed and managed internally. For Playwright tests, you can stub a valid session cookie if needed.
    await this.page.context().addCookies([{
      name: 'authjs.session-token',
      value: 'test-session-token', // Replace with a valid token if needed for integration
      domain: 'localhost',
      path: '/',
    }])

  return testUser
  }
} 