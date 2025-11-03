'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { useInstantData } from '../../../../lib/useInstantData'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Edit,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface StudentApplicationViewProps {
  studentId: string;
}

export function StudentApplicationView({ studentId }: StudentApplicationViewProps) {
  const { users, profiles, error, usedFallback } = useInstantData();
  const [studentFromView, setStudentFromView] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Check if this is coming from the view application with stored data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fromView') === 'true') {
      const storedData = localStorage.getItem('studentApplicationData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setStudentFromView(parsedData);
          setIsInitialLoading(false);
          // Clear the stored data
          localStorage.removeItem('studentApplicationData');
        } catch (err) {
          console.error('Error parsing stored student data:', err);
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    } else {
      // Normal loading - wait for data
      setIsInitialLoading(false);
    }
  }, []);
  
  // Process specific student application data
  const processedData = useMemo(() => {
    if (error) {
      console.error('Error loading data:', error);
      return null;
    }
    
    try {
      // If we have student data from the view, use it directly
      if (studentFromView) {
        return {
          student: {
            id: studentFromView.id,
            name: studentFromView.name,
            email: studentFromView.email || 'Unknown',
            status: studentFromView.status?.text || 'pending',
            submittedAt: studentFromView.submittedAt || null,
            reviewedAt: studentFromView.reviewedAt || null,
            program: studentFromView.program || 'Unknown',
            country: studentFromView.country || 'Unknown',
            profileData: studentFromView.profile?.data || {}
          },
          profile: studentFromView.profile
        };
      }
      
      // Otherwise, find the specific student user in the database
      const studentUser = users.find(user => user.id === studentId && user.role === 'student');
      
      if (!studentUser) {
        return null;
      }
      
      // Find the student's profile
      const studentProfile = profiles.find(p => p.userId === studentUser.id);
      
      // Combine user and profile data for the specific student
      const studentApplication = {
        id: studentUser.id,
        name: `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim() || studentUser.email || 'Unknown',
        email: studentUser.email,
        status: studentProfile?.data?.applicationStatus || 'pending',
        submittedAt: studentProfile?.data?.submittedAt || null,
        reviewedAt: studentProfile?.data?.reviewedAt || null,
        program: studentProfile?.data?.program || 'Unknown',
        country: studentProfile?.data?.country || 'Unknown',
        // Don't spread the entire data object to avoid rendering issues
        profileData: studentProfile?.data || {}
      };
      
      return {
        student: studentApplication,
        profile: studentProfile
      };
    } catch (err) {
      console.error('Error processing student application:', err);
      return null;
    }
  }, [users, profiles, error, studentId, studentFromView]);

  // Show skeleton loader while data is loading
  if (isInitialLoading || (!studentFromView && users.length === 0 && !error)) {
    return <SkeletonLoader viewType="form" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Loading Data
            </CardTitle>
            <CardDescription>
              Unable to load student application data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>
              Unable to find student application data for ID: {studentId}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { student, profile } = processedData;

  // Debug logging
  // Student application view data loaded

  return (
    <div className="space-y-6">
      {usedFallback && (
        <div className="p-2 text-sm bg-amber-100 text-amber-800 rounded-md">
          Using fallback mock data for demonstration purposes
        </div>
      )}
      
      {/* Student Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Application: {String(student.name)}
          </CardTitle>
          <CardDescription>
            Application details for {String(student.name)} ({String(student.email)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <div className="flex items-center gap-2 mt-1">
                {student.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {student.status === 'pending_review' && <Clock className="h-4 w-4 text-yellow-500" />}
                {student.status === 'under_review' && <FileText className="h-4 w-4 text-blue-500" />}
                {student.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                <Badge variant={student.status === 'approved' ? 'default' : 'secondary'}>
                  {typeof student.status === 'string' 
                    ? student.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) 
                    : 'Unknown'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Program</span>
              <p className="mt-1">{String(student.program)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Country</span>
              <p className="mt-1">{String(student.country)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Application Content */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Complete application information and documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Application Form</h3>
            <p className="text-muted-foreground mb-4">
              This is where you'll add the detailed application form and documents for {String(student.name)}. 
              You can add fields, sections, and functionality step by step.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Review History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Application Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {student.submittedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <Badge variant="outline">
                  {new Date(student.submittedAt).toLocaleDateString()}
                </Badge>
              </div>
            )}
            {student.reviewedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reviewed</span>
                <Badge variant="outline">
                  {new Date(student.reviewedAt).toLocaleDateString()}
                </Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <Badge variant={student.status === 'approved' ? 'default' : 'secondary'}>
                {typeof student.status === 'string' 
                  ? student.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) 
                  : 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 