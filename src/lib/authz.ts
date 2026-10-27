import type { Role } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { notFound, redirect } from 'next/navigation'

import { authConfig } from '@/lib/auth'
import { verifyApiKey } from '@/lib/api-keys'
import prisma from '@/lib/db'

export type RequestUser = {
  id: string
  role: Role
  via: 'apiKey' | 'session'
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  const match = header?.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

// Session-only lookup. The role is read from the database so that role changes apply immediately.
export async function getSessionUser(): Promise<RequestUser | null> {
  const session = await getServerSession(authConfig)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return null
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  return user ? { ...user, via: 'session' } : null
}

// For route handlers that accept either an API key (Authorization: Bearer) or a session cookie.
// A Bearer header that fails verification is rejected rather than falling back to the session.
export async function getRequestUser(request: Request): Promise<RequestUser | null> {
  const token = getBearerToken(request)
  if (token) {
    const user = await verifyApiKey(token)
    return user ? { id: user.id, role: user.role, via: 'apiKey' } : null
  }
  return getSessionUser()
}

// For server components in the admin area
export async function requireAdminSession(callbackUrl: string): Promise<RequestUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }
  if (user.role !== 'ADMIN') {
    notFound()
  }
  return user
}
