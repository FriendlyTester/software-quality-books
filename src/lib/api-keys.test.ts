import type { Mock } from 'vitest'

import { API_KEY_PREFIX, createApiKey, generateApiKey, hashApiKey, revokeApiKey, verifyApiKey } from './api-keys'


import prisma from '@/lib/db'


vi.mock('@/lib/db', () => ({
  default: {
    apiKey: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const apiKeyDb = prisma.apiKey as unknown as Record<'create' | 'findFirst' | 'findUnique' | 'update', Mock>

const storedKey = (overrides: Record<string, unknown> = {}) => ({
  id: 'key-1',
  revokedAt: null,
  user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
  ...overrides,
})

beforeEach(() => {
  vi.resetAllMocks()
  apiKeyDb.update.mockResolvedValue({})
})

describe('generateApiKey', () => {
  it('generates a prefixed key whose hash and display prefix match', () => {
    const { plaintext, prefix, hashedKey } = generateApiKey()

    expect(plaintext.startsWith(API_KEY_PREFIX)).toBe(true)
    expect(plaintext.slice(API_KEY_PREFIX.length).startsWith(prefix)).toBe(true)
    expect(prefix).toHaveLength(8)
    expect(hashedKey).toBe(hashApiKey(plaintext))
    expect(hashedKey).toMatch(/^[0-9a-f]{64}$/)
  })

  it('generates a different key each time', () => {
    expect(generateApiKey().plaintext).not.toBe(generateApiKey().plaintext)
  })
})

describe('createApiKey', () => {
  it('stores only the hash and returns the plaintext once', async () => {
    apiKeyDb.create.mockImplementation(async ({ data }) => ({ id: 'key-1', name: data.name, prefix: data.prefix }))

    const { plaintext } = await createApiKey('user-1', 'CI')

    const { data } = apiKeyDb.create.mock.calls[0][0]
    expect(data).toMatchObject({ name: 'CI', userId: 'user-1', hashedKey: hashApiKey(plaintext) })
    expect(JSON.stringify(data)).not.toContain(plaintext)
  })
})

describe('verifyApiKey', () => {
  it('returns the owner of a valid key and records usage', async () => {
    apiKeyDb.findUnique.mockResolvedValue(storedKey())

    const user = await verifyApiKey('sqb_valid')

    expect(user).toEqual({ id: 'user-1', email: 'admin@example.com', role: 'ADMIN' })
    expect(apiKeyDb.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { hashedKey: hashApiKey('sqb_valid') },
    }))
    expect(apiKeyDb.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'key-1' } }))
  })

  it.each([undefined, null, '', 'not-a-key'])('rejects %j without querying the database', async (token) => {
    expect(await verifyApiKey(token)).toBeNull()
    expect(apiKeyDb.findUnique).not.toHaveBeenCalled()
  })

  it('rejects an unknown key', async () => {
    apiKeyDb.findUnique.mockResolvedValue(null)
    expect(await verifyApiKey('sqb_unknown')).toBeNull()
  })

  it('rejects a revoked key', async () => {
    apiKeyDb.findUnique.mockResolvedValue(storedKey({ revokedAt: new Date() }))
    expect(await verifyApiKey('sqb_revoked')).toBeNull()
  })

  it('rejects a key whose owner is no longer an admin', async () => {
    apiKeyDb.findUnique.mockResolvedValue(storedKey({ user: { id: 'user-1', email: 'a@b.c', role: 'USER' } }))
    expect(await verifyApiKey('sqb_demoted')).toBeNull()
  })
})

describe('revokeApiKey', () => {
  it('returns null for a key owned by someone else', async () => {
    apiKeyDb.findFirst.mockResolvedValue(null)

    expect(await revokeApiKey('user-1', 'key-2')).toBeNull()
    expect(apiKeyDb.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'key-2', userId: 'user-1' } }))
    expect(apiKeyDb.update).not.toHaveBeenCalled()
  })

  it('sets revokedAt on an active key', async () => {
    apiKeyDb.findFirst.mockResolvedValue({ id: 'key-1', revokedAt: null })
    apiKeyDb.update.mockResolvedValue({ id: 'key-1', revokedAt: new Date() })

    await revokeApiKey('user-1', 'key-1')

    expect(apiKeyDb.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'key-1' },
      data: { revokedAt: expect.any(Date) },
    }))
  })
})
