import { test, expect } from '@playwright/test'

import { ApiBookCreator, ApiCreatorError, BookBuilder, UserBuilder } from '../../src/lib/test-data'
import { PrismaBookCreator, PrismaUserCreator, type CreatedUser } from '../../src/lib/test-data/prisma'

import { ApiHelper } from './api-helper'
import { McpHelper } from './mcp-helper'

const appUrl = process.env.BASE_URL || 'http://localhost:3000'

test.describe('API keys', () => {
  const userCreator = new PrismaUserCreator()
  const bookCreator = new PrismaBookCreator()
  let api: ApiHelper
  let user: CreatedUser | undefined
  const createdBookIds: string[] = []

  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request)
  })

  test.afterEach(async () => {
    // Books outlive their owner (onDelete: SetNull), so remove them explicitly
    for (const id of createdBookIds.splice(0)) {
      await bookCreator.delete(id)
    }
    if (user) {
      await userCreator.delete(user.email)
      user = undefined
    }
  })

  async function loginAs(userBuilder: UserBuilder) {
    user = await userCreator.create(userBuilder.build())
    await api.login({ email: user.email, password: user.password })
    return user
  }

  async function createKey(name = 'Test key') {
    const response = await api.createApiKey(name)
    expect(response.status()).toBe(201)
    return response.json() as Promise<{ id: string; key: string; prefix: string }>
  }

  test('an admin can create a key and it is only returned once', async () => {
    await loginAs(UserBuilder.aUser().asAdmin())

    const created = await createKey('CI pipeline')
    expect(created.key).toMatch(/^sqb_/)
    expect(created.key.slice(4).startsWith(created.prefix)).toBeTruthy()

    const keys = await (await api.listApiKeys()).json()
    expect(keys).toHaveLength(1)
    expect(keys[0]).toMatchObject({ id: created.id, name: 'CI pipeline', revokedAt: null })
    expect(JSON.stringify(keys)).not.toContain(created.key)
  })

  test('a non-admin cannot manage keys', async () => {
    await loginAs(UserBuilder.aUser())

    expect((await api.createApiKey('Nope')).status()).toBe(403)
    expect((await api.listApiKeys()).status()).toBe(403)
  })

  test('a key cannot be used to manage keys', async ({ playwright }) => {
    await loginAs(UserBuilder.aUser().asAdmin())
    const { key } = await createKey()

    const keyOnly = await playwright.request.newContext({
      baseURL: appUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${key}` }
    })
    expect((await keyOnly.get('/api/api-keys')).status()).toBe(401)
    expect((await keyOnly.post('/api/api-keys', { data: { name: 'Another' } })).status()).toBe(401)
    await keyOnly.dispose()
  })

  test('the API creator creates a book owned by the key holder', async () => {
    const admin = await loginAs(UserBuilder.aUser().asAdmin())
    const { key } = await createKey()
    const model = BookBuilder.aBook().withTitle('Created with an API key').build()

    const book = await new ApiBookCreator({ baseUrl: appUrl, apiKey: key }).create(model)
    createdBookIds.push(book.id)

    expect(book).toMatchObject({ title: model.title, description: model.description, userId: admin.id })
  })

  test('a revoked key is rejected', async () => {
    await loginAs(UserBuilder.aUser().asAdmin())
    const { id, key } = await createKey()

    expect((await api.revokeApiKey(id)).ok()).toBeTruthy()

    const error = await new ApiBookCreator({ baseUrl: appUrl, apiKey: key })
      .create(BookBuilder.aBook().build())
      .catch(e => e)
    expect(error).toBeInstanceOf(ApiCreatorError)
    expect(error.status).toBe(401)
  })

  test('an invalid key is rejected rather than falling back to the session', async () => {
    await loginAs(UserBuilder.aUser().asAdmin())

    const error = await new ApiBookCreator({ baseUrl: appUrl, apiKey: 'sqb_not-a-real-key' })
      .create(BookBuilder.aBook().build())
      .catch(e => e)
    expect(error.status).toBe(401)
  })
})

test.describe('MCP server', () => {
  const userCreator = new PrismaUserCreator()
  const bookCreator = new PrismaBookCreator()
  let user: CreatedUser
  let apiKey: string
  const createdBookIds: string[] = []

  test.beforeEach(async ({ request }) => {
    const api = new ApiHelper(request)
    user = await userCreator.create(UserBuilder.aUser().asAdmin().build())
    await api.login({ email: user.email, password: user.password })
    apiKey = (await (await api.createApiKey('MCP')).json()).key
  })

  test.afterEach(async () => {
    for (const id of createdBookIds.splice(0)) {
      await bookCreator.delete(id)
    }
    await userCreator.delete(user.email)
  })

  test('requires an API key', async ({ playwright }) => {
    // A fresh context so the session cookie from beforeEach is not sent
    const anonymous = await playwright.request.newContext({ baseURL: appUrl })
    const mcp = new McpHelper(anonymous)

    expect((await mcp.send('tools/list')).status()).toBe(401)
    expect((await mcp.send('tools/list', {}, 'sqb_not-a-real-key')).status()).toBe(401)
    await anonymous.dispose()
  })

  test('lists the Create a Book tool', async ({ request }) => {
    const { result } = await new McpHelper(request).call('tools/list', {}, apiKey)

    expect(result?.tools).toEqual([
      expect.objectContaining({ name: 'create_book', title: 'Create a Book' })
    ])
  })

  test('creates a book via the API', async ({ request }) => {
    const { result } = await new McpHelper(request).createBook({ title: 'Created over MCP' }, apiKey)

    expect(result?.isError).toBeFalsy()
    const book = result?.structuredContent as { id: string; title: string; description: string; userId: string }
    createdBookIds.push(book.id)
    expect(book).toMatchObject({ title: 'Created over MCP', userId: user.id })
    expect(book.description.length).toBeGreaterThan(0)
  })

  test('returns a tool error for invalid input', async ({ request }) => {
    const { result } = await new McpHelper(request).createBook({ title: 'a'.repeat(101) }, apiKey)

    expect(result?.isError).toBe(true)
  })
})
