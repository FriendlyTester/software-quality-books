import { Page, Locator } from '@playwright/test'

export class ApiKeysPage {
  readonly page: Page
  readonly nameField: Locator
  readonly createButton: Locator
  readonly newKey: Locator
  readonly rows: Locator

  constructor(page: Page) {
    this.page = page
    this.nameField = page.getByLabel('Key name')
    this.createButton = page.getByRole('button', { name: 'Create API Key' })
    this.newKey = page.getByTestId('new-api-key')
    // Next keeps a hidden copy of the previous render around during router.refresh(), so ignore hidden rows
    this.rows = page.getByTestId('api-key-row').filter({ visible: true })
  }

  async goto() {
    await this.page.goto('/admin/api-keys')
  }

  async createKey(name: string) {
    await this.nameField.fill(name)
    await this.createButton.click()
  }

  row(name: string) {
    return this.rows.filter({ hasText: name })
  }

  async revoke(name: string) {
    this.page.once('dialog', dialog => dialog.accept())
    await this.page.getByRole('button', { name: `Revoke ${name}` }).click()
  }
}
