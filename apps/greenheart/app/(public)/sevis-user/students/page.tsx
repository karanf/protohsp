'use client'

import { Suspense, use } from 'react'
import { StudentsView } from '../views/students'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface StudentsPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default function StudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialStatusFilter = resolvedSearchParams?.filter;
  
  // Progressive loading: render StudentsView immediately
  // Let StudentsView handle its own loading and error states
  return (
    <Suspense fallback={<SkeletonLoader viewType="table" />}>
      <StudentsView initialStatusFilter={initialStatusFilter} />
    </Suspense>
  )
} 