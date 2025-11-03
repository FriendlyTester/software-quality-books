import { Page, Locator } from '@playwright/test'

export class ReviewPage {
  readonly page: Page
  readonly reviewForm: Locator
  readonly contentInput: Locator
  readonly ratingSelect: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.reviewForm = page.locator('form')
    this.contentInput = page.getByLabel('Review')
    this.ratingSelect = page.getByLabel('Rating')
    this.submitButton = page.getByRole('button', { name: /Submit Review|Submitting.../ })
  }

  async goto(bookId: string) {
    await this.page.goto(`/books/${bookId}`)
  }

  async submitReview(content: string, rating: number) {
    await this.contentInput.fill(content)
    if (rating > 0) {
      await this.ratingSelect.selectOption(rating.toString())
    }
    const shouldExpectNetwork = content.trim().length > 0 && rating > 0

    if (shouldExpectNetwork) {
      const [reviewResponse] = await Promise.all([
        this.page.waitForResponse(res =>
          res.url().includes('/api/books/') &&
          res.url().includes('/reviews') &&
          res.request().method() === 'POST'
        ),
        this.submitButton.click()
      ])

      if (!reviewResponse.ok()) {
        throw new Error(`Review submission failed with status ${reviewResponse.status()}`)
      }
    } else {
      await this.submitButton.click()
    }
  }

  getReviewCard(content: string): Locator {
    return this.page.getByText(content).first()
  }

  getReviewRating(content: string): Locator {
    return this.getReviewCard(content).locator('..').getByText(/★+/)
  }
}