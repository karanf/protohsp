'use client'

import { Suspense } from 'react'
import { LocalCoordinatorsView } from '../views/local-coordinators'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function LocalCoordinatorsPage() {
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <LocalCoordinatorsView />
    </Suspense>
  )
} 