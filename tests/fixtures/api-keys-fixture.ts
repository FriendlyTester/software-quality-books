import { test as base } from '@playwright/test'

import { ApiKeysPage } from '../page-objects/api-keys-page'
import { AuthHelper } from '../helpers/auth.helper'

type ApiKeysFixtures = {
  apiKeysPage: ApiKeysPage
  authHelper: AuthHelper
}

export const test = base.extend<ApiKeysFixtures>({
  apiKeysPage: async ({ page }, use) => {
    await use(new ApiKeysPage(page))
  },
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page))
  }
})

export { expect } from '@playwright/test'
