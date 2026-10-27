# Software Quality Books

A web application for managing and reviewing software quality books.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) 24 (see `.nvmrc`; run `nvm use`)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

## Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) 24 (see `.nvmrc`; run `nvm use`)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))
cd software-quality-books
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`:
3. Set up your environment variables:
   - Copy `.env.development` to `.env`:
   ```bash
   cp .env.development .env
   ```
   - Update the following variables in `.env`:
     - `DATABASE_URL`: Your database connection string
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `NEXTAUTH_URL`: `http://localhost:3000` for local development
   ```bash
   cp .env.development .env
   ```
   - Update the following variables in `.env`:
     - `DATABASE_URL`: Your database connection string
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```
     - `NEXTAUTH_URL`: `http://localhost:3000` for local development

## Technology Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Auth.js v5](https://authjs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```
### Database Issues
If you encounter database-related errors:
```bash
# Reset the database and apply all migrations
npx prisma migrate reset
npm run seed
```

You can also run Prisma Studio to view the database:
```bash
npx prisma studio
```

 User authentication with Auth.js v5

## Test Users

After seeding the database, you can log in with these test accounts:
- Email: `test@test.com` / Password: `password123` (ADMIN)
- Email: `bob@example.com` / Password: `password123`

## Running Tests

```bash
# Run end-to-end tests (Playwright)
npm run test:e2e

# Run API tests (Playwright)
npm run test:api

# Run unit and component tests (Vitest)
npm run test:unit

# Run Pact consumer contract tests (Vitest)
npm run test:pact

# Run all Vitest suites with coverage
npm test
```

## Test Data Builders and Creators

Test data lives in `src/lib/test-data` so it can be shared by the tests and the MCP server.

- **Builders** (`BookBuilder`, `UserBuilder`) only produce plain models (`BookModel`, `UserModel`) and fill anything you don't set with faker data.
- **Creators** take one of those models and persist it:
  - `ApiBookCreator` sends it to `POST /api/books` using an API key. The API assigns the id and owner.
  - `PrismaBookCreator` and `PrismaUserCreator` write directly to the database. Import them from `src/lib/test-data/prisma`.

```ts
const user = await new PrismaUserCreator().create(UserBuilder.aUser().asAdmin().build())
const book = await new PrismaBookCreator().create(BookBuilder.aBook().withUserId(user.id).build())

const viaApi = await new ApiBookCreator({ baseUrl: 'http://localhost:3000', apiKey })
  .create(BookBuilder.aBook().withTitle('Lessons Learned').build())
```

## API Keys and the MCP Server

Users have a role of `USER` or `ADMIN`. Only admins can manage API keys, and a key acts as the admin who created it. A key stops working when it is revoked or when its owner is no longer an admin.

1. Make a user an admin. They must have registered already, and need to sign in again before the Admin link appears in the menu.
   - Locally: the seed makes `test@test.com` an admin. For anyone else run `npm run admin:promote -- someone@example.com`.
   - Production: there are no seeded admins, so promote the first one against the production Postgres database:
     ```bash
     vercel env pull .env.production --environment=production
     npm run admin:promote:prod -- someone@example.com
     ```
     After that, admins can be promoted the same way. The script fails if no user has that email.
2. Create a key at `/admin/api-keys`. The key is only shown once.

**REST API**: send the key as a Bearer token. Only `POST /api/books` accepts keys so far; other routes still need a session.

```bash
curl -X POST https://<host>/api/books \
  -H "Authorization: Bearer sqb_..." -H "Content-Type: application/json" \
  -d '{"title":"Explore It!","description":"Exploratory testing"}'
```

**MCP server**: available at `/api/mcp` over Streamable HTTP, with one tool, `create_book` ("Create a Book"). Its `title` and `description` arguments are optional and generated when you leave them out. The tool builds a book with `BookBuilder` and passes your key through to `ApiBookCreator`, so it goes through the same API and checks as the REST call above.

```bash
claude mcp add --transport http software-quality-books https://<host>/api/mcp \
  --header "Authorization: Bearer sqb_..."
```

You can also test it locally with `npx @modelcontextprotocol/inspector`, pointed at `http://localhost:3000/api/mcp`.

The MCP server calls the app's own API through `APP_BASE_URL`. If that isn't set, it uses Vercel's production URL, or `http://localhost:3000`. On preview deployments with Vercel Deployment Protection turned on, that internal call is blocked, so use production or configure a protection bypass.

## Project Structure

```
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # Reusable React components
│   ├── lib/            # Utility functions and configurations
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── prisma/             # Database schema and migrations
├── tests/              # End-to-end tests
│   ├── fixtures/       # Test fixtures
│   ├── helpers/        # Test helper functions
│   └── page-objects/   # Page object models
└── public/             # Static files
```

## Key Features

- User authentication with NextAuth.js
- Book management (Create, Read, Update, Delete)
- Book reviews and ratings
- User profiles
- End-to-end and API testing with Playwright
- Unit, component and contract testing with Vitest

## Technology Stack

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)

### Database Issues
If you encounter database-related errors:
```bash
# Reset the database
npx prisma db push --force-reset
npm run seed
```

You can also run the Prisma Studio to view the database:
```bash
npx prisma studio
```

## VS Code Extensions
You may want to install the following extensions
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) - Adds syntax highlighting and formatting for Prisma schema files
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - Provides autocomplete and syntax highlighting for Tailwind CSS classes
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - JavaScript/TypeScript linting
- [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) - Run and debug Playwright tests


## Live Instance
[Vercal Hosted Instance](https://software-quality-books.vercel.app/)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)


## License

This project is part of a training course and is intended for educational purposes only.
