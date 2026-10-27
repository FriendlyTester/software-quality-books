// Base URL the server uses to call its own REST API (e.g. from the MCP server)
export function getAppBaseUrl(): string {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL
  }
  const vercelHost =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL
  if (vercelHost) {
    return `https://${vercelHost}`
  }
  return 'http://localhost:3000'
}
