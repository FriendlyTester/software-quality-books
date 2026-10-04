'use client'

export default function GlobalError(_props: {
  error: Error & { digest?: string }
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Software Quality Books</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, background: '#ffffff', color: '#171717', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <header style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <a href="/" style={{ color: '#171717', fontWeight: 700, textDecoration: 'none' }}>
            Software Quality Books
          </a>
        </header>
        <main style={{ maxWidth: 640, margin: '64px auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            We could not load this page. Please try again later.
          </p>
          <a href="/books" style={{ color: '#2563eb', display: 'inline-block', padding: '12px 0' }}>
            Back to Books
          </a>
        </main>
      </body>
    </html>
  )
}