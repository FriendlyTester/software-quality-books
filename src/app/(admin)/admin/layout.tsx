import Link from 'next/link'

import { requireAdminSession } from '@/lib/authz'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession('/admin/api-keys')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <nav aria-label="Admin" className="mt-2 flex gap-4 text-sm">
          <Link href="/admin/api-keys" className="text-blue-600 hover:underline">
            API Keys
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
