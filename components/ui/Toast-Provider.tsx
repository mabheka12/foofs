// components/ui/toast-provider.tsx
'use client'

import { ToastProvider as Provider, ToastViewport } from './Toaster'
import { Toaster } from './Toaster-Implementation'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      {children}
      <Toaster />
      <ToastViewport />
    </Provider>
  )
}