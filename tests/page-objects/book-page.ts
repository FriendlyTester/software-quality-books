import { Page } from '@playwright/test'

export class BookPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(bookId: string) {
    await this.page.goto(`/books/${bookId}`)
  }

  async getBookTitle(): Promise<string | null> {
    return await this.page.getByTestId('book-title').textContent()
  }

  async getBookDescription(): Promise<string | null> {
    return await this.page.getByTestId('book-description').textContent()
  }
} 