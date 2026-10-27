import { BookBuilder } from './book-builder'
import { UserBuilder } from './user-builder'

describe('BookBuilder', () => {
  it('builds a book with generated defaults and no owner', () => {
    const book = BookBuilder.aBook().build()

    expect(book.id).toEqual(expect.any(String))
    expect(book.title.length).toBeGreaterThan(0)
    expect(book.description.length).toBeGreaterThan(0)
    expect(book.userId).toBeUndefined()
  })

  it('applies overrides', () => {
    const book = BookBuilder.aBook()
      .withTitle('Explore It!')
      .withDescription('Exploratory testing')
      .withUserId('user-1')
      .build()

    expect(book).toMatchObject({ title: 'Explore It!', description: 'Exploratory testing', userId: 'user-1' })
  })

  it('returns a copy so later changes do not affect built models', () => {
    const builder = BookBuilder.aBook().withTitle('First')
    const first = builder.build()
    builder.withTitle('Second')

    expect(first.title).toBe('First')
  })
})

describe('UserBuilder', () => {
  it('builds a regular user by default', () => {
    expect(UserBuilder.aUser().build().role).toBe('USER')
  })

  it('applies overrides', () => {
    const user = UserBuilder.aUser()
      .withEmail('admin@example.com')
      .withPassword('password123')
      .withName('Ada')
      .asAdmin()
      .build()

    expect(user).toMatchObject({ email: 'admin@example.com', password: 'password123', name: 'Ada', role: 'ADMIN' })
  })
})
