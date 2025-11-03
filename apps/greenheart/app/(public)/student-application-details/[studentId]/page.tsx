import * as React from 'react';
import { StudentApplicationDetailsClient } from './student-application-details-client';

interface StudentApplicationDetailsPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentApplicationDetailsPage({ params }: StudentApplicationDetailsPageProps) {
  // Await the params to get the studentId (even though we're not using it in this component)
  const { studentId } = await params;
  
  // Create a client component to handle the rest of the logic
  return <StudentApplicationDetailsClient studentId={studentId} />;
} 