import { PactV3, MatchersV3 } from '@pact-foundation/pact'
import fetch from 'node-fetch';

import config from '../../pact.config'

import { Book } from '@/types/book'

const { like } = MatchersV3

describe('Book Details API Contract', () => {
  const provider = new PactV3({
    ...config,
    logLevel: 'warn'
  })

  const expectedBook = {
    id: like('123e4567-e89b-12d3-a456-426614174000'),
    title: like('Test Book'),
    description: like('A test book description'),
    createdAt: like('2024-01-01T00:00:00.000Z'),
    updatedAt: like('2024-01-01T00:00:00.000Z'),
    userId: like('user123')
  }

  describe('get /api/books/{id}', () => {
    it('returns a specific book when it exists', async () => {
      // Set up the expected interaction
      await provider
        .given('a book exists')
        .uponReceiving('a request for a specific book')
        .withRequest({
          method: 'GET',
          path: '/api/books/123e4567-e89b-12d3-a456-426614174000',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like(expectedBook),
        })

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(
          `${mockServer.url}/api/books/123e4567-e89b-12d3-a456-426614174000`
        )
        const book: Book = await response.json()

        expect(response.status).toBe(200)
        expect(book).toHaveProperty('id')
        expect(book).toHaveProperty('title')
        expect(book).toHaveProperty('description')
      })
    })

    it('returns 404 when book does not exist', async () => {
      await provider
        .given('no book exists with ID')
        .uponReceiving('a request for a non-existent book')
        .withRequest({
          method: 'GET',
          path: '/api/books/nonexistent-id',
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            error: 'Book not found'
          }),
        })

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(
          `${mockServer.url}/api/books/nonexistent-id`
        )
        const error = await response.json()

        expect(response.status).toBe(404)
        expect(error).toHaveProperty('error', 'Book not found')
      })
    })
  })
}) 