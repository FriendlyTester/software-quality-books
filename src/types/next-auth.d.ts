// Auth.js v5: If you need to extend session types, use @auth/core types or module augmentation for @auth/react

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
  }
} 