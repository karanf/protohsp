'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/components/ui/card'
import { Metrics } from '@repo/ui/components/ui/metrics'
import { useInstantData } from '@/lib/useInstantData'
import { useMounted } from '@/lib/useMounted'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

// Optimized icon imports - only import what we need for home view
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  FileCheck, 
  Database, 
  XCircle, 
  Calendar, 
  UserCheck, 
  FileUp, 
  FileX, 
  RefreshCw, 
  Home, 
  Globe, 
  AlertTriangle, 
  Edit, 
  Award, 
  Building, 
  CreditCard, 
  FileQuestion, 
  Repeat, 
  FileDown, 
  RotateCcw, 
  UserX 
} from 'lucide-react'

// Helper for more type-safe access to metadata
const getMetadataValue = (user: any, key: string): string | undefined => {
  if (!user?.metadata) return undefined;
  return user.metadata[key] as string | undefined;
};

export function HomeView() {
  const { users, profiles, relationships, error, usedFallback, usingServiceClient } = useInstantData();
  const [selectedProgram, setSelectedProgram] = useState('all');
  const router = useRouter();
  const mounted = useMounted();
  
  // Handle Fix button click to navigate to student application details
  const handleFixRecord = (record: any) => {
    router.push(`/sevis-user/student-application/${record.userId}`);
  };

  // Handle Review button clicks for different application types
  const handleReviewStudents = () => {
    router.push('/sevis-user/students?filter=pending-review');
  };

  const handleReviewHostFamilies = () => {
    router.push('/sevis-user/host-families?filter=pending');
  };

  const handleReviewLocalCoordinators = () => {
    router.push('/sevis-user/local-coordinators?filter=training');
  };

  const handleReviewSchools = () => {
    // Schools page doesn't exist yet, so just navigate to a placeholder
    router.push('/sevis-user/students');
  };

  const handleViewAllFailedSevis = () => {
    router.push('/sevis-user/sevis?filter=failed&tab=individual-records');
  };
  
  // SEVIS categories from the image
  const sevisCategories = [
    { id: 'new_student', name: 'New Student', icon: UserCheck, count: 28 },
    { id: 'validation_housing', name: 'Validation - Housing', icon: Home, count: 15 },
    { id: 'validation_site', name: 'Validation - Site of Activity', icon: Building, count: 12 },
    { id: 'payment', name: 'Payment', icon: CreditCard, count: 7 },
    { id: 'bio', name: 'Bio', icon: FileQuestion, count: 22 },
    { id: 'update_housing', name: 'Update - Housing', icon: Home, count: 18 },
    { id: 'update_site', name: 'Update - Site of Activity', icon: Building, count: 14 },
    { id: 'program_date', name: 'Program Date', icon: Calendar, count: 19 },
    { id: 'program_extension', name: 'Program Extension', icon: Repeat, count: 8 },
    { id: 'program_shorten', name: 'Program Shorten', icon: RotateCcw, count: 5 },
    { id: 'reprint', name: 'Reprint', icon: FileDown, count: 11 },
    { id: 'status_end', name: 'Status End', icon: XCircle, count: 9 },
    { id: 'status_invalid', name: 'Status Invalid', icon: AlertTriangle, count: 3 },
    { id: 'status_terminate', name: 'Status Terminate', icon: UserX, count: 2 },
    { id: 'update_editsubject', name: 'Update - EditSubject', icon: Edit, count: 16 },
    { id: 'financial_info', name: 'Financial Info', icon: CreditCard, count: 13 }
  ];
  
  // Use state for the student metrics
  const [studentMetrics, setStudentMetrics] = useState({
    totalStudents: 0,
    pendingReview: 0,
    accepted: 0,
    readyForSevis: 0
  });

  // Use state for the SEVIS metrics
  const [sevisMetrics, setSevisMetrics] = useState({
    totalRecords: 0,
    readyForSevis: 0,
    inSevisQueue: 0,
    submittedToSevis: 0,
    lastBatchSuccessful: 0,
    lastBatchFailed: 0
  });
  
  // Application metrics
  const [applicationMetrics, setApplicationMetrics] = useState({
    pendingReview: {
      students: 0,
      hosts: 0,
      localCoordinators: 0,
      schools: 0
    }
  });

  // Failed SEVIS records
  const [failedSevisRecords, setFailedSevisRecords] = useState<Array<{
    id: string;
    userId: string;
    name: string;
    sevisId: string;
    errorMessage: string;
    changeType: string;
    firstName: string;
    lastName: string;
    profile: any;
  }>>([]);

  // Memoize processed metrics to prevent infinite re-renders
  const processedMetrics = useMemo(() => {
    if (error) {
      console.error('Error loading data:', error);
      return null;
    }
    
    try {
      // Get users by role
      const studentUsers = users.filter(user => user.role === 'student');
      const hostUsers = users.filter(user => user.role === 'host');
      const lcUsers = users.filter(user => user.role === 'local_coordinator');
      
      // Get actual application status counts from profile data
      const studentProfiles = profiles.filter(p => 
        studentUsers.some(u => u.id === p.userId)
      );
      
      const hostProfiles = profiles.filter(p => 
        hostUsers.some(u => u.id === p.userId)
      );
      
      const lcProfiles = profiles.filter(p => 
        lcUsers.some(u => u.id === p.userId)
      );
      
      // Process application metrics from real profile data
      const applicationMetrics = {
        pendingReview: {
          students: studentProfiles.filter(p => p.data?.applicationStatus === 'pending_review').length,
          hosts: hostProfiles.filter(p => p.data?.applicationStatus === 'pending_review').length,
          localCoordinators: lcProfiles.filter(p => p.data?.applicationStatus === 'pending_review').length,
          schools: 0 // Schools don't have profiles in current data structure
        }
      };
      
      // Process student metrics from real profile data
      const totalStudents = studentUsers.length;
      const pendingReviewCount = studentProfiles.filter(p => p.data?.applicationStatus === 'pending_review').length;
      const underReviewCount = studentProfiles.filter(p => p.data?.applicationStatus === 'under_review').length;
      const approvedCount = studentProfiles.filter(p => p.data?.applicationStatus === 'approved').length;
      const rejectedCount = studentProfiles.filter(p => p.data?.applicationStatus === 'rejected').length;
      
      const studentMetrics = {
        totalStudents,
        pendingReview: pendingReviewCount,
        accepted: approvedCount, // Changed from accepted to approved to match our data
        readyForSevis: studentProfiles.filter(p => 
          p.data?.applicationStatus === 'approved' && p.data?.sevisStatus === 'ready_for_sevis'
        ).length
      };
      
      // Process SEVIS metrics from approved students only
      const approvedStudentProfiles = studentProfiles.filter(p => p.data?.applicationStatus === 'approved');
      
      const readyForSevis = approvedStudentProfiles.filter(p => p.data?.sevisStatus === 'ready_for_sevis').length;
      const inSevisQueue = approvedStudentProfiles.filter(p => p.data?.sevisStatus === 'in_sevis_queue').length;
      const submittedToSevis = approvedStudentProfiles.filter(p => p.data?.sevisStatus === 'submitted_to_sevis').length;
      const lastBatchSuccessful = approvedStudentProfiles.filter(p => p.data?.sevisStatus === 'sevis_approved').length;
      const lastBatchFailed = approvedStudentProfiles.filter(p => p.data?.sevisStatus === 'sevis_failed').length;
      
      const sevisMetrics = {
        totalRecords: approvedCount, // Only approved students can have SEVIS records
        readyForSevis,
        inSevisQueue,
        submittedToSevis,
        lastBatchSuccessful,
        lastBatchFailed
      };

      // Get actual failed SEVIS records with student details
      const failedSevisRecords = approvedStudentProfiles
        .filter(p => p.data?.sevisStatus === 'sevis_failed')
        .map(profile => {
          const studentUser = studentUsers.find(u => u.id === profile.userId);
          const firstName = getMetadataValue(studentUser, 'firstName') || profile.data?.first_name || 'Unknown';
          const lastName = getMetadataValue(studentUser, 'lastName') || profile.data?.last_name || 'Student';
          const name = `${firstName} ${lastName}`;
          const sevisId = profile.data?.sevis_id || profile.data?.sevisId || `N00${Math.floor(10000 + Math.random() * 90000)}`;
          const errorMessage = profile.data?.sevisMessage || 'Processing failed - No details available';
          const changeType = profile.data?.changeType || profile.data?.sevis_processing_type || 'New Student';
          
          return {
            id: profile.id,
            userId: profile.userId,
            name,
            sevisId,
            errorMessage,
            changeType,
            firstName,
            lastName,
            profile
          };
        })
        .slice(0, 10); // Limit to first 10 for display
      
      return {
        applicationMetrics,
        studentMetrics,
        sevisMetrics,
        failedSevisRecords
      };
    } catch (err) {
      console.error('Error processing metrics:', err);
      return null;
    }
  }, [users, profiles, relationships, error]); // Memoize based on actual data dependencies

  // Update state when processed metrics change
  useEffect(() => {
    if (processedMetrics) {
      setApplicationMetrics(processedMetrics.applicationMetrics);
      setStudentMetrics(processedMetrics.studentMetrics);
      setSevisMetrics(processedMetrics.sevisMetrics);
      setFailedSevisRecords(processedMetrics.failedSevisRecords);
    }
  }, [processedMetrics]); // Only depend on the memoized processed metrics

  return (
    <div className="space-y-6">
      {usedFallback && (
        <div className="p-2 text-sm bg-amber-100 text-amber-800 rounded-md">
          Using fallback mock data for demonstration purposes
        </div>
      )}
      
      {/* Main metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Applications & SEVIS Overview</CardTitle>
          <CardDescription>Key metrics for application review and SEVIS processing</CardDescription>
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Applications Pending",
              value: applicationMetrics.pendingReview.students + applicationMetrics.pendingReview.hosts + applicationMetrics.pendingReview.localCoordinators,
              icon: Clock,
              variant: "warning",
              unit: "requiring your review"
            },
            {
              title: "SEVIS Ready",
              value: sevisMetrics.readyForSevis,
              icon: FileCheck,
              variant: "info",
              unit: "needs batch processing"
            },
            {
              title: "SEVIS In Queue",
              value: sevisMetrics.inSevisQueue,
              icon: Database,
              variant: "warning",
              unit: "currently processing"
            },
            {
              title: "Failed Records",
              value: sevisMetrics.lastBatchFailed,
              icon: FileX,
              variant: "error",
              unit: "need correction"
            }
          ]} />
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {/* First row: Applications Pending Review + SEVIS Batch Processing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Applications that need review */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Applications Pending Review</CardTitle>
                <CardDescription>New applications waiting for your review</CardDescription>
              </div>
              <Badge className="ml-2" suppressHydrationWarning>
                {mounted ? applicationMetrics.pendingReview.students + applicationMetrics.pendingReview.hosts + applicationMetrics.pendingReview.localCoordinators + applicationMetrics.pendingReview.schools : 0}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Student Applications</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{mounted ? applicationMetrics.pendingReview.students : 0} new applications</p>
                    </div>
                  </div>
                  <Button size="default" variant="secondary" onClick={handleReviewStudents}>Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Host Family Applications</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{mounted ? applicationMetrics.pendingReview.hosts : 0} new applications</p>
                    </div>
                  </div>
                  <Button size="default" variant="secondary" onClick={handleReviewHostFamilies}>Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Local Coordinator Applications</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{mounted ? applicationMetrics.pendingReview.localCoordinators : 0} new applications</p>
                    </div>
                  </div>
                  <Button size="default" variant="secondary" onClick={handleReviewLocalCoordinators}>Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Building className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">School Applications</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{mounted ? applicationMetrics.pendingReview.schools : 0} new registrations</p>
                    </div>
                  </div>
                  <Button size="default" variant="secondary" onClick={handleReviewSchools}>Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Batch Processing */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>SEVIS Batch Processing</CardTitle>
              <CardDescription>Current and recent batches</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="overflow-y-auto max-h-[300px]">
                <div className="divide-y">
                  {/* In Progress Batches */}
                  <div className="p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium">Batch #2458 - In Progress</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">56 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">High School Program - Started 15 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 28 New Participant records and 28 Validation records</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium">Batch #2457 - In Progress</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">42 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Work & Travel Program - Started 22 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 24 New Participant records and 18 Validation records</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium">Batch #2456 - In Progress</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">38 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Training & Internship Program - Started 8 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 20 New Participant records and 18 Validation records</p>
                  </div>
                  
                  {/* Queued Batches */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-medium">Batch #2455 - Queued</p>
                      </div>
                      <Badge variant="outline">38 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">High School Program - Queued 5 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 22 New Participant records and 16 Validation records</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-medium">Batch #2454 - Queued</p>
                      </div>
                      <Badge variant="outline">45 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Work & Travel Program - Queued 12 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 26 New Participant records and 19 Validation records</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-medium">Batch #2453 - Queued</p>
                      </div>
                      <Badge variant="outline">33 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Training & Internship Program - Queued 18 minutes ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 18 New Participant records and 15 Validation records</p>
                  </div>
                  
                  {/* Complete Batches */}
                  <div className="p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium">Batch #2452 - Complete</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">42 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">High School Program - Completed 1 hour ago</span>
                      <span className="text-green-600 font-medium">41 successful, 1 failed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 25 New Participant records and 17 Validation records</p>
                  </div>
                  
                  <div className="p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium">Batch #2451 - Complete</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">48 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Work & Travel Program - Completed 2 hours ago</span>
                      <span className="text-green-600 font-medium">47 successful, 1 failed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 30 New Participant records and 18 Validation records</p>
                  </div>
                  
                  <div className="p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium">Batch #2450 - Complete</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">36 records</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Training & Internship Program - Completed 3 hours ago</span>
                      <span className="text-green-600 font-medium">36 successful, 0 failed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contains 21 New Participant records and 15 Validation records</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Second row: Failed SEVIS Records + SEVIS Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Failed SEVIS Records needing immediate review */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Failed SEVIS Records</CardTitle>
                <CardDescription>Records requiring correction</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="error" suppressHydrationWarning>{mounted ? sevisMetrics.lastBatchFailed : 0}</Badge>
                {mounted && sevisMetrics.lastBatchFailed > 0 && (
                  <Button variant="outline" size="sm" onClick={handleViewAllFailedSevis}>
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {failedSevisRecords.length > 0 ? (
                  failedSevisRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <FileX className="h-5 w-5 text-red-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{record.name} ({record.sevisId})</p>
                            <Badge variant="outline" className="text-xs">{record.changeType}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Error: {record.errorMessage}</p>
                        </div>
                      </div>
                      <Button size="default" variant="secondary" onClick={() => handleFixRecord(record)}>Fix</Button>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div className="text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">No failed SEVIS records</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* SEVIS Categories */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>SEVIS Categories</CardTitle>
              <CardDescription>Records by category</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="overflow-y-auto max-h-[390px]">
                <div className="grid grid-cols-1 gap-0">
                  {sevisCategories.map(category => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between py-2 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-1.5 rounded-md">
                          <category.icon className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 