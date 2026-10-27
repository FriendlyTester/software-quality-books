import { createHash, randomBytes } from 'crypto'

import prisma from '@/lib/db'

export const API_KEY_PREFIX = 'sqb_'
const DISPLAY_PREFIX_LENGTH = 8

export type ApiKeySummary = {
  id: string
  name: string
  prefix: string
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}

const summaryFields = {
  id: true,
  name: true,
  prefix: true,
  createdAt: true,
  lastUsedAt: true,
  revokedAt: true,
} as const

// Keys are 256 bits of randomness, so a fast hash is sufficient and lets us look them up directly
export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex')
}

export function generateApiKey() {
  const secret = randomBytes(32).toString('base64url')
  const plaintext = `${API_KEY_PREFIX}${secret}`
  return {
    plaintext,
    prefix: secret.slice(0, DISPLAY_PREFIX_LENGTH),
    hashedKey: hashApiKey(plaintext),
  }
}

// Returns the plaintext key; this is the only time it is available
export async function createApiKey(userId: string, name: string) {
  const { plaintext, prefix, hashedKey } = generateApiKey()
  const apiKey = await prisma.apiKey.create({
    data: { name, prefix, hashedKey, userId },
    select: summaryFields,
  })
  return { apiKey, plaintext }
}

export async function listApiKeys(userId: string): Promise<ApiKeySummary[]> {
  return prisma.apiKey.findMany({
    where: { userId },
    select: summaryFields,
    orderBy: { createdAt: 'desc' },
  })
}

// Returns null when the key does not exist or belongs to another user
export async function revokeApiKey(userId: string, id: string): Promise<ApiKeySummary | null> {
  const existing = await prisma.apiKey.findFirst({ where: { id, userId }, select: summaryFields })
  if (!existing) {
    return null
  }
  if (existing.revokedAt) {
    return existing
  }
  return prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
    select: summaryFields,
  })
}

// Resolves an API key to its owner. Keys are only valid while the owner is still an ADMIN.
export async function verifyApiKey(plaintext: string | undefined | null) {
  if (!plaintext?.startsWith(API_KEY_PREFIX)) {
    return null
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey: hashApiKey(plaintext) },
    include: { user: { select: { id: true, email: true, role: true } } },
  })
  if (!apiKey || apiKey.revokedAt || apiKey.user.role !== 'ADMIN') {
    return null
  }

  // Usage tracking must not slow down or fail the request
  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch((error) => console.error('Failed to record API key usage', error))

  return apiKey.user
}
