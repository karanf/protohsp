'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/ui/card'
import { Metrics } from '@repo/ui/components/ui/metrics'
import { useInstantData } from '../../../../lib/useInstantData'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'

// Optimized icon imports - only import what we need for home view
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Home, 
  Award, 
  Building 
} from 'lucide-react'

// Helper for more type-safe access to metadata
const getMetadataValue = (user: any, key: string): string | undefined => {
  if (!user?.metadata) return undefined;
  return user.metadata[key] as string | undefined;
};

export function HomeView() {
  const { users, profiles, relationships, error, usedFallback } = useInstantData();
  
  // Use state for the student metrics
  const [studentMetrics, setStudentMetrics] = useState({
    totalStudents: 0,
    pendingReview: 0,
    accepted: 0,
    readyForReview: 0
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
      const approvedCount = studentProfiles.filter(p => p.data?.applicationStatus === 'approved').length;
      const readyForReviewCount = studentProfiles.filter(p => p.data?.applicationStatus === 'ready_for_review').length;
      
      const studentMetrics = {
        totalStudents,
        pendingReview: pendingReviewCount,
        accepted: approvedCount,
        readyForReview: readyForReviewCount
      };
      
      return {
        applicationMetrics,
        studentMetrics
      };
    } catch (err) {
      console.error('Error processing metrics:', err);
      return null;
    }
  }, [users, profiles, relationships, error]);

  // Update state when processed metrics change
  useEffect(() => {
    if (processedMetrics) {
      setApplicationMetrics(processedMetrics.applicationMetrics);
      setStudentMetrics(processedMetrics.studentMetrics);
    }
  }, [processedMetrics]);

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
          <CardTitle>Applications Overview</CardTitle>
          <CardDescription>Key metrics for application review and processing</CardDescription>
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Total Students",
              value: studentMetrics.totalStudents,
              icon: Users,
              variant: "info",
              unit: "registered"
            },
            {
              title: "Pending Review",
              value: applicationMetrics.pendingReview.students + applicationMetrics.pendingReview.hosts + applicationMetrics.pendingReview.localCoordinators,
              icon: Clock,
              variant: "warning",
              unit: "requiring review"
            },
            {
              title: "Approved",
              value: studentMetrics.accepted,
              icon: CheckCircle,
              variant: "success",
              unit: "applications"
            },
            {
              title: "Ready for Review",
              value: studentMetrics.readyForReview,
              icon: CheckCircle,
              variant: "info",
              unit: "applications"
            }
          ]} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Applications that need review */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Applications Pending Review</CardTitle>
                <CardDescription>New applications waiting for your review</CardDescription>
              </div>
              <Badge className="ml-2">
                {applicationMetrics.pendingReview.students + applicationMetrics.pendingReview.hosts + applicationMetrics.pendingReview.localCoordinators + applicationMetrics.pendingReview.schools}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Student Applications</p>
                      <p className="text-xs text-muted-foreground">{applicationMetrics.pendingReview.students} new applications</p>
                    </div>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Host Family Applications</p>
                      <p className="text-xs text-muted-foreground">{applicationMetrics.pendingReview.hosts} new applications</p>
                    </div>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Local Coordinator Applications</p>
                      <p className="text-xs text-muted-foreground">{applicationMetrics.pendingReview.localCoordinators} new applications</p>
                    </div>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <Building className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">School Applications</p>
                      <p className="text-xs text-muted-foreground">{applicationMetrics.pendingReview.schools} new registrations</p>
                    </div>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent application updates and reviews</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium">Application Approved</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Student</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Emma Garcia's application was approved 2 hours ago</p>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <p className="text-sm font-medium">New Application</p>
                    </div>
                    <Badge variant="outline">Host Family</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">The Johnson family submitted their application 4 hours ago</p>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium">Profile Updated</p>
                    </div>
                    <Badge variant="outline">Student</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Marcus Thompson updated his profile information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 