import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly signInButton: Locator
  readonly passwordField: Locator
  readonly emailField: Locator

  constructor(page: Page) {
    this.page = page
    this.signInButton = page.locator('button[type="submit"]')
    this.passwordField = page.locator('input[name="password"]')
    this.emailField = page.locator('input[name="email"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async fillPassword(password: string) {
    await this.passwordField.waitFor({ state: 'visible' })
    await this.passwordField.fill(password)
  }

  async fillEmail(email: string) {
    await this.emailField.waitFor({ state: 'visible' })
    await this.emailField.fill(email)
  }

  async clickSignIn() {
    await this.signInButton.waitFor({ state: 'visible' })
    await this.signInButton.click()
  }
} 