'use client'

import { Suspense, use } from 'react'
import { LocalCoordinatorsView } from '../views/local-coordinators'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface LocalCoordinatorsPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default function LocalCoordinatorsPage({ searchParams }: LocalCoordinatorsPageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialStatusFilter = resolvedSearchParams?.filter;
  
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <LocalCoordinatorsView initialStatusFilter={initialStatusFilter} />
    </Suspense>
  )
} 