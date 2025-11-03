'use client'

import { Suspense } from 'react'
import { ChangeQueueView } from '../views/change-queue'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function ChangeQueuePage() {
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <ChangeQueueView />
    </Suspense>
  )
} 