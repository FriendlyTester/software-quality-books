import { create } from 'zustand'

type NotificationState = {
  message: string | null
  type: 'success' | 'error' | null
  showNotification: (message: string, type: 'success' | 'error') => void
  clearNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: null,
  showNotification: (messageValue, typeValue) => set({
    message: messageValue,
    type: typeValue
  }),
  clearNotification: () => set({ message: null, type: null })
})) 