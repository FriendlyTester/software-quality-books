// Removed deprecated next-auth/jwt encode import
import { Page } from '@playwright/test'

import { UserBuilder } from '../data-builders/user-builder'

type BuiltUser = Awaited<ReturnType<UserBuilder['create']>>

export class AuthHelper {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async loginUser(user?: BuiltUser) {
    const testUser = user ?? await new UserBuilder().create()

    // Start with a clean auth state to avoid leaking sessions between tests
  await this.page.context().clearCookies()

  const csrfResponse = await this.page.request.get('/api/auth/csrf')
    if (!csrfResponse.ok()) {
      throw new Error('Failed to retrieve CSRF token for login')
    }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken?: string }
    if (!csrfToken) {
      throw new Error('No CSRF token returned from auth endpoint')
    }

  const signInResponse = await this.page.request.post('/api/auth/callback/credentials', {
      form: {
        csrfToken,
        email: testUser.email,
        password: testUser.password,
        callbackUrl: '/'
      }
    })

    if (signInResponse.status() >= 400) {
      throw new Error(`Failed to sign in test user. Status: ${signInResponse.status()}`)
    }

  const sessionResponse = await this.page.request.get('/api/auth/session')
    if (!sessionResponse.ok()) {
      throw new Error('Failed to verify authenticated session')
    }

    const sessionData = await sessionResponse.json() as {
      user?: { id?: string; email?: string | null }
    }

    if (sessionData.user?.email !== testUser.email) {
      throw new Error('Authenticated session does not match test user')
    }

    // Ensure browser context picks up newly set cookies
  await this.page.goto('/')

    return testUser
  }
}