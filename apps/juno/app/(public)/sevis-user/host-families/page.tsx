'use client'

import { Suspense } from 'react'
import { HostFamiliesView } from '../views/host-families'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function HostFamiliesPage() {
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <HostFamiliesView />
    </Suspense>
  )
} 