import { test as base } from '@playwright/test'

import { NewBookPage } from '../page-objects/new-book-page'
import { AuthHelper } from '../helpers/auth.helper'
import { UserBuilder } from '../data-builders/user-builder'

type NewBookFixtures = {
  newBookPage: NewBookPage
  authHelper: AuthHelper
  userBuilder: UserBuilder
}

export const test = base.extend<NewBookFixtures>({
  newBookPage: async ({ page }, use) => {
    await use(new NewBookPage(page))
  },
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page))
  },
  userBuilder: async ({}, use) => {
    await use(new UserBuilder())
  }
})

export { expect } from '@playwright/test' 