'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { StudentApplicationDetailsView } from '@repo/ui/components/templates/table-expanded-views/student-application-details-view';
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader';

interface StudentApplicationDetailsClientProps {
  studentId: string;
}

export function StudentApplicationDetailsClient({ studentId }: StudentApplicationDetailsClientProps) {
  const searchParams = useSearchParams();
  const [student, setStudent] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // First try to get student data from localStorage (for immediate access)
    const storedData = localStorage.getItem('studentApplicationData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setStudent(parsedData);
        setIsLoading(false);
        // Clear the localStorage data after use
        localStorage.removeItem('studentApplicationData');
      } catch (error) {
        console.error('Error parsing student data from localStorage:', error);
      }
    }

    // If no localStorage data, try to fetch from URL params
    if (!storedData) {
      const studentDataParam = searchParams.get('data');
      if (studentDataParam) {
        try {
          const decodedData = decodeURIComponent(studentDataParam);
          const parsedData = JSON.parse(decodedData);
          setStudent(parsedData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing student data from URL params:', error);
        }
      }
    }

    // If still no data, show error state
    if (!storedData && !searchParams.get('data')) {
      setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header skeleton */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <SkeletonLoader viewType="details" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Student data not found</div>
          <div className="text-sm text-muted-foreground mt-2">
            Unable to load student application details. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StudentApplicationDetailsView 
        student={student}
        onClose={() => {
          // Close the window when close button is clicked
          window.close();
        }}
      />
    </div>
  );
} 