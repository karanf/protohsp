import { db } from '../client';

/**
 * Hook to fetch student application comprehensive data by profile ID
 * Provides real-time updates and offline-first functionality
 */
export function useStudentApplication(profileId: string) {
  // Return empty data if InstantDB client is not available
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { studentApplications: [] },
      error: null,
      isLoading: false,
      applicationData: null
    };
  }

  // Use InstantDB reactive query for real-time student application data
  const result = db.useQuery({
    studentApplications: {
      $: {
        where: {
          profileId: profileId
        }
      }
    }
  });

  // Extract the application data
  const applications = result.data?.studentApplications || [];
  const applicationData = applications.length > 0 ? applications[0] : null;

  return {
    data: result.data || { studentApplications: [] },
    error: result.error || null,
    isLoading: result.isLoading || false,
    applicationData: applicationData,
    comprehensiveData: applicationData?.comprehensiveData || null
  };
}

/**
 * Hook to fetch all student applications
 */
export function useAllStudentApplications() {
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { studentApplications: [] },
      error: null,
      isLoading: false
    };
  }

  // Use InstantDB reactive query for all student applications
  const result = db.useQuery({
    studentApplications: {}
  });

  return {
    data: result.data || { studentApplications: [] },
    error: result.error || null,
    isLoading: result.isLoading || false
  };
} 