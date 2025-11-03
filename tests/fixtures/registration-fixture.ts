import { test as base } from '@playwright/test'

import { RegisterPage } from '../page-objects/register-page'
import { UserBuilder } from '../data-builders/user-builder'
import { RegistrationHelper } from '../helpers/registration.helper'

type Pages = {
  registerPage: RegisterPage
}

export type TestFixtures = {
  userBuilder: UserBuilder;
  registrationHelper: RegistrationHelper;
};

// Extend basic test fixture with our pages
export const test = base.extend<Pages & TestFixtures>({
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page))
  },
  userBuilder: async ({}, use) => {
    await use(new UserBuilder())
  },
  registrationHelper: async ({ registerPage }, use) => {
    await use(new RegistrationHelper(registerPage))
  }
})

export { expect } from '@playwright/test' 