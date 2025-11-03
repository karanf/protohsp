'use client'

import { Suspense, use } from 'react'
import { SevisView } from '../views/sevis'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface SEVISPageProps {
  searchParams: Promise<{
    filter?: string;
    tab?: string;
  }>;
}

export default function SEVISPage({ searchParams }: SEVISPageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialStatusFilter = resolvedSearchParams?.filter;
  
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="details" />}>
      <SevisView 
        initialStatusFilter={initialStatusFilter} 
      />
    </Suspense>
  )
} 