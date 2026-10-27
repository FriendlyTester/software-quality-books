import { NextResponse } from 'next/server'

import { revokeApiKey } from '@/lib/api-keys'
import { getBearerToken, getSessionUser } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getBearerToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const apiKey = await revokeApiKey(user.id, id)
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }
    return NextResponse.json(apiKey)
  } catch (err) {
    console.error('Failed to revoke API key', err)
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 })
  }
}
