"use client"
import SessionProvider from '@/components/SessionProvider'
import Navigation from '@/components/Navigation'
import Notification from '@/components/Notification'

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navigation />
      <Notification />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </SessionProvider>
  )
}