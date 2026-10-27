import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { z } from 'zod'

import { verifyApiKey } from '@/lib/api-keys'
import { getAppBaseUrl } from '@/lib/app-url'
import { ApiBookCreator, ApiCreatorError, BookBuilder } from '@/lib/test-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CreateBookInput = z.object({
  title: z.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe('Book title (1-100 characters). Generated if omitted.'),
  description: z.string()
    .min(1)
    .max(750)
    .optional()
    .describe('Book description (1-750 characters). Generated if omitted.'),
})

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'create_book',
      {
        title: 'Create a Book',
        description:
          'Creates a book in Software Quality Books, owned by the user of the API key. ' +
          'Any field left out is filled with generated test data.',
        inputSchema: CreateBookInput,
      },
      async ({ title, description }, ctx) => {
        const apiKey = ctx.http?.authInfo?.token
        if (!apiKey) {
          return { isError: true, content: [{ type: 'text', text: 'Missing API key' }] }
        }

        const builder = BookBuilder.aBook()
        if (title) builder.withTitle(title)
        if (description) builder.withDescription(description)

        try {
          // The same API key is passed through, so the REST API applies its own authorisation
          const book = await new ApiBookCreator({ baseUrl: getAppBaseUrl(), apiKey }).create(builder.build())
          return {
            content: [{ type: 'text', text: JSON.stringify(book, null, 2) }],
            structuredContent: book,
          }
        } catch (error) {
          const message =
            error instanceof ApiCreatorError
              ? `Failed to create book (${error.status}): ${error.message}`
              : 'Failed to create book'
          if (!(error instanceof ApiCreatorError)) {
            console.error('MCP create_book failed', error)
          }
          return { isError: true, content: [{ type: 'text', text: message }] }
        }
      }
    )
  },
  { serverInfo: { name: 'software-quality-books', version: '1.0.0' } }
)

const authHandler = withMcpAuth(
  handler,
  async (_request, bearerToken) => {
    const user = await verifyApiKey(bearerToken)
    if (!user) {
      return undefined
    }
    return { token: bearerToken!, clientId: user.id, scopes: [] }
  },
  { required: true }
)

export { authHandler as GET, authHandler as POST, authHandler as DELETE }
