'use client'

import { Suspense, use } from 'react'
import { HostFamiliesView } from '../views/host-families'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface HostFamiliesPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default function HostFamiliesPage({ searchParams }: HostFamiliesPageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialStatusFilter = resolvedSearchParams?.filter;
  
  // Progressive loading: render immediately, let view handle its own loading
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <HostFamiliesView initialStatusFilter={initialStatusFilter} />
    </Suspense>
  )
} 