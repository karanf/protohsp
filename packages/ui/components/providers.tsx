import React from 'react'
import { ToastProvider } from '@repo/ui/lib/toast-service'
import { Toaster } from '@repo/ui/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Centralized providers component to wrap the application with all necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
      {/* Global toast container - positioned outside the component tree */}
      <Toaster position="bottom-right" closeButton />
    </ToastProvider>
  )
} 