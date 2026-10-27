'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useNotificationStore } from '@/lib/store/notification'

export type ApiKeyRow = {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Never'

export default function ApiKeyList({ apiKeys }: { apiKeys: ApiKeyRow[] }) {
  const router = useRouter()
  const [revokingId, setRevokingId] = useState<string>()
  const showNotification = useNotificationStore(state => state.showNotification)

  const revoke = async (apiKey: ApiKeyRow) => {
    if (!window.confirm(`Revoke "${apiKey.name}"? Anything using this key will stop working.`)) {
      return
    }

    setRevokingId(apiKey.id)
    try {
      const res = await fetch(`/api/api-keys/${apiKey.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to revoke API key')
      }
      showNotification('API key revoked', 'success')
      router.refresh()
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      )
    } finally {
      setRevokingId(undefined)
    }
  }

  if (apiKeys.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">You have no API keys yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left" aria-label="API keys">
        <thead className="border-b">
          <tr>
            <th scope="col" className="py-2 pr-4">Name</th>
            <th scope="col" className="py-2 pr-4">Key</th>
            <th scope="col" className="py-2 pr-4">Created</th>
            <th scope="col" className="py-2 pr-4">Last used</th>
            <th scope="col" className="py-2 pr-4">Status</th>
            <th scope="col" className="py-2"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id} className="border-b" data-testid="api-key-row">
              <td className="py-2 pr-4 font-medium">{apiKey.name}</td>
              <td className="py-2 pr-4 font-mono text-xs">sqb_{apiKey.prefix}…</td>
              <td className="py-2 pr-4">{formatDate(apiKey.createdAt)}</td>
              <td className="py-2 pr-4">{formatDate(apiKey.lastUsedAt)}</td>
              <td className="py-2 pr-4">
                {apiKey.revokedAt ? (
                  <span className="text-red-600">Revoked</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </td>
              <td className="py-2 text-right">
                {apiKey.revokedAt ? null : (
                  <button
                    type="button"
                    onClick={() => revoke(apiKey)}
                    disabled={revokingId === apiKey.id}
                    className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300"
                    aria-label={`Revoke ${apiKey.name}`}
                  >
                    {revokingId === apiKey.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
