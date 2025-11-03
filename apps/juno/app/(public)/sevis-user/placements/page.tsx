'use client'

import { Suspense } from 'react'
import { PlacementsView } from '../views/placements'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function PlacementsPage() {
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <PlacementsView />
    </Suspense>
  )
} 