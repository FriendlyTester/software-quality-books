import { BookSchema } from './book'

describe('BookSchema title validation', () => {
  it.each(['', '   ', '\t', '\n', ' \t\n ', '\u00a0'])('rejects a blank title %j', (title) => {
    const result = BookSchema.safeParse({ title, description: 'A book description' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['title'],
        message: 'Title is required'
      })
    }
  })

  it('trims surrounding whitespace and preserves spaces within a valid title', () => {
    const result = BookSchema.parse({
      title: ' \t Software Quality Books \n ',
      description: 'A book description'
    })

    expect(result.title).toBe('Software Quality Books')
  })

  it('accepts a title at the maximum length', () => {
    expect(BookSchema.safeParse({
      title: 'A'.repeat(100),
      description: 'A book description'
    }).success).toBe(true)
  })

  it('rejects a title exceeding the maximum length', () => {
    expect(BookSchema.safeParse({
      title: 'A'.repeat(101),
      description: 'A book description'
    }).success).toBe(false)
  })
})