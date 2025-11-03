'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if component has mounted on client.
 * Returns false during SSR, true after client hydration.
 * Use this to prevent hydration mismatches for dynamic data.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

