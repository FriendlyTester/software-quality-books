import { APIRequestContext } from '@playwright/test'

type JsonRpcResponse = {
  id: number
  result?: Record<string, unknown>
  error?: { code: number; message: string }
}

// Minimal Streamable HTTP client for the MCP endpoint
export class McpHelper {
  private readonly request: APIRequestContext
  private nextId = 1

  constructor(request: APIRequestContext) {
    this.request = request
  }

  async send(method: string, params: Record<string, unknown> = {}, apiKey?: string) {
    return this.request.post('/api/mcp', {
      data: { jsonrpc: '2.0', id: this.nextId++, method, params },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-06-18',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      }
    })
  }

  async call(method: string, params: Record<string, unknown>, apiKey: string): Promise<JsonRpcResponse> {
    const response = await this.send(method, params, apiKey)
    if (!response.ok()) {
      throw new Error(`MCP request failed with status ${response.status()}`)
    }
    const body = await response.text()
    // Responses may be plain JSON or a single server-sent event
    const data = body.trim().startsWith('{')
      ? body
      : body.split('\n').find(line => line.startsWith('data:'))?.slice('data:'.length)
    if (!data) {
      throw new Error(`Unexpected MCP response: ${body}`)
    }
    return JSON.parse(data) as JsonRpcResponse
  }

  async createBook(args: { title?: string; description?: string }, apiKey: string) {
    return this.call('tools/call', { name: 'create_book', arguments: args }, apiKey)
  }
}
