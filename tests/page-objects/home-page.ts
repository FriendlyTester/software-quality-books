import { Page, Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly signInButton: Locator
  readonly addBookButton: Locator

  constructor(page: Page) {
    this.page = page
    this.signInButton = page.getByTestId('sign-in-button')
    this.addBookButton = page.getByRole('link', { name: 'Add New Book' })
  }

  async goto() {
    await this.page.goto('/')
  }

  async clickSignIn() {
    await this.signInButton.waitFor({ state: 'visible' })
    await this.signInButton.click()
  }

  async getAddBookButton() {
    return this.addBookButton
  }
} 