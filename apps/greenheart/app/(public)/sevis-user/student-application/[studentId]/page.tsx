'use client'

import { Suspense, use } from 'react'
import { StudentApplicationView } from '../../views/student-application'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface StudentApplicationPageProps {
  params: Promise<{
    studentId: string
  }>
}

export default function StudentApplicationPage({ params }: StudentApplicationPageProps) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.studentId
  
  // Debug logging
  // Student application page loaded for student ID
  
  // Ensure studentId is a string
  if (!studentId || typeof studentId !== 'string') {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error: Invalid student ID. Expected string, got: {typeof studentId}
        </div>
      </div>
    )
  }
  
  return (
    <Suspense fallback={<SkeletonLoader viewType="form" />}>
      <StudentApplicationView studentId={studentId} />
    </Suspense>
  )
} 