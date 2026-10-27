import { ApiBookCreator, ApiCreatorError } from './api-book-creator'

const book = { id: 'b1', title: 'A Title', description: 'A description', userId: 'u1' }

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('ApiBookCreator', () => {
  it('posts the title and description with the API key as a bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { ...book, id: 'server-id' }))
    const creator = new ApiBookCreator({ baseUrl: 'https://example.com/', apiKey: 'sqb_key', fetch: fetchMock })

    const created = await creator.create(book)

    expect(created.id).toBe('server-id')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.com/api/books')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer sqb_key', 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual({ title: 'A Title', description: 'A description' })
  })

  it('throws an ApiCreatorError with the API error message', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, { error: 'Title is required' }))
    const creator = new ApiBookCreator({ baseUrl: 'https://example.com', apiKey: 'sqb_key', fetch: fetchMock })

    const error = await creator.create(book).catch((e) => e)

    expect(error).toBeInstanceOf(ApiCreatorError)
    expect(error).toMatchObject({ status: 400, message: 'Title is required' })
  })

  it('falls back to the status when the error response is not JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 }))
    const creator = new ApiBookCreator({ baseUrl: 'https://example.com', apiKey: 'sqb_key', fetch: fetchMock })

    await expect(creator.create(book)).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    })
  })
})
