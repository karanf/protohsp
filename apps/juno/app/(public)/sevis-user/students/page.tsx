'use client'

import { Suspense } from 'react'
import { StudentsView } from '../views/students'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

export default function StudentsPage() {
  // Progressive loading: render StudentsView immediately
  // Let StudentsView handle its own loading and error states
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <StudentsView />
    </Suspense>
  )
} 