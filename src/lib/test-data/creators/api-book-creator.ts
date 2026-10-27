import type { BookModel } from '../models'

import type { Creator } from './types'

export type CreatedBook = {
  id: string
  title: string
  description: string
  userId: string | null
  createdAt: string
  updatedAt: string
}

export type ApiBookCreatorOptions = {
  baseUrl: string
  apiKey: string
  fetch?: typeof fetch
}

export class ApiCreatorError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiCreatorError'
  }
}

// Creates books through the public REST API (POST /api/books), authenticated with an API key.
// Only title and description are sent: the API assigns the id and sets the owner to the key's user,
// so BookModel.id and BookModel.userId are ignored.
export class ApiBookCreator implements Creator<BookModel, CreatedBook> {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor({ baseUrl, apiKey, fetch: fetchImpl = fetch }: ApiBookCreatorOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
    this.fetch = fetchImpl
  }

  async create(model: BookModel): Promise<CreatedBook> {
    const response = await this.fetch(`${this.baseUrl}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ title: model.title, description: model.description }),
    })

    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const message = (body as { error?: string } | null)?.error ?? `Request failed with status ${response.status}`
      throw new ApiCreatorError(message, response.status)
    }
    return body as CreatedBook
  }
}
