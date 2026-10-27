import ApiKeyList from '@/components/admin/ApiKeyList'
import CreateApiKeyForm from '@/components/admin/CreateApiKeyForm'
import { listApiKeys } from '@/lib/api-keys'
import { requireAdminSession } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
  // The layout also checks this, but pages render independently of layouts so check here too
  const user = await requireAdminSession('/admin/api-keys')
  const apiKeys = await listApiKeys(user.id)

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-2">API Keys</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          API keys authenticate requests to the REST API and the MCP server. Send them as{' '}
          <code className="px-1 bg-gray-100 dark:bg-gray-800 rounded">Authorization: Bearer &lt;key&gt;</code>.
          A key acts as you, so keep it secret.
        </p>
        <div className="max-w-md">
          <CreateApiKeyForm />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your keys</h2>
        <ApiKeyList
          apiKeys={apiKeys.map((key) => ({
            ...key,
            createdAt: key.createdAt.toISOString(),
            lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
            revokedAt: key.revokedAt?.toISOString() ?? null,
          }))}
        />
      </section>
    </div>
  )
}
