import { test, expect } from '../fixtures/api-keys-fixture'
import prisma from '../../src/lib/db'
import { UserBuilder } from '../../src/lib/test-data'
import { PrismaUserCreator, type CreatedUser } from '../../src/lib/test-data/prisma'

test.describe('Admin API keys', () => {
  const userCreator = new PrismaUserCreator()
  let testUser: CreatedUser | undefined

  test.afterEach(async () => {
    if (testUser) {
      await userCreator.delete(testUser.email)
      testUser = undefined
    }
  })

  test('shows the Admin link in the user menu for admins', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().asAdmin().build()))
    const page = apiKeysPage.page

    await page.getByRole('button', { name: testUser.email }).click()
    await page.getByRole('link', { name: 'Admin' }).click()

    await expect(page).toHaveURL('/admin/api-keys')
    await expect(apiKeysPage.createButton).toBeVisible()
  })

  test('does not show the Admin link to non-admins', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().build()))
    const page = apiKeysPage.page

    await page.getByRole('button', { name: testUser.email }).click()

    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible()
  })

  test('shows the Admin link after promotion without signing in again', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().build()))
    const page = apiKeysPage.page

    await prisma.user.update({ where: { id: testUser.id }, data: { role: 'ADMIN' } })
    await page.reload()
    await page.getByRole('button', { name: testUser.email }).click()

    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()
  })

  test('redirects to login when signed out', async ({ apiKeysPage }) => {
    await apiKeysPage.goto()
    await expect(apiKeysPage.page).toHaveURL(/\/login\?callbackUrl=/)
  })

  test('is not available to non-admin users', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().build()))

    await apiKeysPage.goto()

    await expect(apiKeysPage.createButton).not.toBeVisible()
    await expect(apiKeysPage.page.getByText('404')).toBeVisible()
  })

  test('lets an admin create a key, shown once, and revoke it', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().asAdmin().build()))

    await apiKeysPage.goto()
    await apiKeysPage.createKey('E2E key')

    await expect(apiKeysPage.newKey).toHaveValue(/^sqb_/)
    await expect(apiKeysPage.row('E2E key')).toContainText('Active')

    await apiKeysPage.page.reload()
    await expect(apiKeysPage.newKey).not.toBeVisible()

    await apiKeysPage.revoke('E2E key')
    await expect(apiKeysPage.row('E2E key')).toContainText('Revoked')
  })

  test('shows a validation error for an empty name', async ({ apiKeysPage, authHelper }) => {
    testUser = await authHelper.loginUser(await userCreator.create(UserBuilder.aUser().asAdmin().build()))

    await apiKeysPage.goto()
    await apiKeysPage.createKey('')

    await expect(apiKeysPage.page.getByText('Name is required')).toBeVisible()
  })
})
