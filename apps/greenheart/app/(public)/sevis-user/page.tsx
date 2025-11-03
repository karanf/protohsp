'use client'

import { Suspense } from 'react'
import { HomeView } from './views/home'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function SEVISUserPage() {
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="dashboard" />}>
      <HomeView />
    </Suspense>
  )
} 