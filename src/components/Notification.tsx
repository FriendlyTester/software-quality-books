'use client'

import { useEffect } from 'react'

import { useNotificationStore } from '@/lib/store/notification'

export default function Notification() {
  const { message, type, clearNotification } = useNotificationStore()

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearNotification, 5000) // Auto-clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [message, clearNotification])

  if (!message) return null

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50'
  const textColor = type === 'success' ? 'text-green-600' : 'text-red-500'

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} p-4 rounded-lg shadow-lg`}>
      {message}
    </div>
  )
} 