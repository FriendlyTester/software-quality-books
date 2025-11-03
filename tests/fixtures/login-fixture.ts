import { test as base } from '@playwright/test'

import { LoginPage } from '../page-objects/login-page'

export type TestFixtures = {
  loginPage: LoginPage
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  }
})