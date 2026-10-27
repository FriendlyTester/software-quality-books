'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ApiKeyCreateSchema } from '@/lib/validations/api-key'
import { useNotificationStore } from '@/lib/store/notification'

export default function CreateApiKeyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string>()
  const [createdKey, setCreatedKey] = useState<string>()
  const [copied, setCopied] = useState(false)
  const showNotification = useNotificationStore(state => state.showNotification)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldError(undefined)
    const form = e.currentTarget

    const result = ApiKeyCreateSchema.safeParse({ name: new FormData(form).get('name') })
    if (!result.success) {
      setFieldError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create API key')
      }

      setCreatedKey(data.key)
      setCopied(false)
      form.reset()
      showNotification('API key created successfully!', 'success')
      router.refresh()
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyKey = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey)
    setCopied(true)
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        noValidate={true}
        className="space-y-4"
        aria-label="Create API Key Form"
      >
        <div>
          <label htmlFor="api-key-name" className="block text-sm font-medium">
            Key name
          </label>
          <input
            type="text"
            id="api-key-name"
            name="name"
            required={true}
            placeholder="e.g. Claude MCP"
            className="w-full px-3 py-2 border rounded-lg"
            aria-required="true"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'api-key-name-error' : undefined}
          />
          {fieldError ? <p id="api-key-name-error" role="alert" className="mt-1 text-sm text-red-500">
            {fieldError}
          </p> : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
          aria-busy={loading}
        >
          {loading ? 'Creating...' : 'Create API Key'}
        </button>
      </form>

      {createdKey ? (
        <div role="status" className="p-4 border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-2">
          <p className="text-sm font-medium">
            Copy your new API key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex gap-2">
            <input
              readOnly={true}
              value={createdKey}
              aria-label="New API key"
              data-testid="new-api-key"
              className="flex-1 px-3 py-2 border rounded-lg font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyKey}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
