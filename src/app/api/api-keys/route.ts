import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { createApiKey, listApiKeys } from '@/lib/api-keys'
import { getBearerToken, getSessionUser } from '@/lib/authz'
import { ApiKeyCreateSchema } from '@/lib/validations/api-key'

export const dynamic = 'force-dynamic'

// API keys can only be managed from an interactive admin session, never with another API key
async function authorizeAdmin(request: Request) {
  if (getBearerToken(request)) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const user = await getSessionUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

export async function GET(request: Request) {
  const { user, error } = await authorizeAdmin(request)
  if (error) {
    return error
  }

  try {
    return NextResponse.json(await listApiKeys(user.id))
  } catch (err) {
    console.error('Failed to fetch API keys', err)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user, error } = await authorizeAdmin(request)
  if (error) {
    return error
  }

  try {
    const { name } = ApiKeyCreateSchema.parse(await request.json())
    const { apiKey, plaintext } = await createApiKey(user.id, name)
    return NextResponse.json({ ...apiKey, key: plaintext }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('Failed to create API key', err)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
