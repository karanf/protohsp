'use client'

import { useState, useMemo, useEffect, Fragment, CSSProperties, useRef } from "react"
import { useInstantData } from '../../../../lib/useInstantData'
import type { User, Profile, Relationship } from '../../../../lib/useInstantData'
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@repo/ui/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { cn } from "@repo/ui/lib/utils"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar"
import { Metrics, Metric } from "@repo/ui/components/ui/metrics"
import dynamic from 'next/dynamic'
import { Suspense, lazy } from "react"

// Import utility function normally (lightweight)
import { createActionsColumn } from "@repo/ui/components/ui/advanced-pinned-table"

// Dynamic import only for heavy components to reduce initial bundle size
const AdvancedPinnedTable = dynamic(
  () => import("@repo/ui/components/ui/advanced-pinned-table").then(mod => ({ default: mod.AdvancedPinnedTable })),
  { 
    loading: () => <div className="h-96 flex items-center justify-center text-gray-500">Loading table...</div>,
    ssr: false 
  }
)

// Optimized icon imports - only import what we need
import { 
  ChevronDown, 
  AlertTriangle, 
  UserCircle, 
  FileEdit, 
  FileText, 
  Send, 
  School, 
  Home, 
  FileBarChart, 
  Tag, 
  Users, 
  Clock, 
  CheckCircle, 
  FileCheck 
} from "lucide-react"

// Define Student type based on InstantDB data structure
interface Student {
  id: string;
  name: string;
  country: string;
  grade: string;
  gender: string;
  program: string;
  partner: string;
  approvedOn: string;
  approvedBy: string;
  status: { text: string; color: string }; // Keep for backward compatibility
  applicationStatus: { text: string; color: string };
  sevisStatus: { text: string; color: string } | null;
  dob: string;
  hostFamilyName: string;
  school: string;
  startDate: string;
  endDate: string;
  sevisId: string;
  lastAction: string;
  avatarUrl: string | undefined;
  initials: string;
  profile: Profile;
  firstName: string;
  lastName: string;
  // Add the actual InstantDB data fields that contain realistic content
  data?: any; // This will contain all the comprehensive student data from InstantDB
}

// Type for the enhanced student data used in the table
interface EnhancedStudent extends Student {
  statusText: string;
  statusDisplay: string;
  applicationStatusText: string;
  sevisStatusText: string;
}

// Helper functions
const getUser = (users: User[], userId: string) => users.find(u => u.id === userId);
const getProfile = (profiles: Profile[], profileId: string) => profiles.find(p => p.id === profileId);
const getProfileByUserId = (profiles: Profile[], userId: string) => profiles.find(p => p.userId === userId);
const getHostStudentRelationship = (relationships: Relationship[], studentProfileId: string) => 
  relationships.find(r => r.type === 'host_student' && r.secondaryId === studentProfileId);
const getSendingOrgStudentRelationship = (relationships: Relationship[], studentProfileId: string) => 
  relationships.find(r => r.type === 'sending_org_student' && r.secondaryId === studentProfileId);
const getHostUserByProfileId = (users: User[], profiles: Profile[], hostProfileId: string) => {
  const profile = getProfile(profiles, hostProfileId);
  return profile ? getUser(users, profile.userId) : null;
};

// Define props for the component
interface StudentsViewProps {}

export function StudentsView({}: StudentsViewProps = {}) {
  const { users, profiles, relationships, error, usedFallback, usingServiceClient } = useInstantData();
  const [students, setStudents] = useState<Student[]>([]);
  const [isViewLoading, setIsViewLoading] = useState(true);
  
  // Generate fallback students with hardcoded values to avoid TypeScript issues
  const generateFallbackStudents = (): Student[] => {
    // Return hardcoded fallback student data to avoid TypeScript errors
    const fallbackStudents: Student[] = [
      {
        id: 'fallback-1',
        name: 'Emma Schmidt',
        country: 'Germany',
        grade: '9',
        gender: 'Female',
        program: 'Academic Year',
        partner: 'Global Exchange',
        approvedOn: '01/15/2024',
        approvedBy: 'Sarah Mitchell',
        status: { text: 'Pending Review', color: 'amber' },
        applicationStatus: { text: 'Pending Review', color: 'amber' },
        sevisStatus: null,
        dob: '2008-05-12',
        hostFamilyName: 'Johnson Family',
        school: 'Washington High',
        startDate: '2024-08-01',
        endDate: '2025-06-15',
        sevisId: 'N12345678',
        lastAction: 'Application Submitted',
        avatarUrl: undefined,
        initials: 'ES',
        profile: {} as Profile,
        firstName: 'Emma',
        lastName: 'Schmidt',
        data: {}
      },
      {
        id: 'fallback-2',
        name: 'Lukas Müller',
        country: 'Germany',
        grade: '10',
        gender: 'Male',
        program: 'Semester (Fall)',
        partner: 'EduWorld',
        approvedOn: '02/20/2024',
        approvedBy: 'David Rodriguez',
        status: { text: 'Approved', color: 'green' },
        applicationStatus: { text: 'Approved', color: 'green' },
        sevisStatus: { text: 'SEVIS Approved', color: 'green' },
        dob: '2007-11-08',
        hostFamilyName: 'Smith Family',
        school: 'Lincoln Academy',
        startDate: '2024-08-15',
        endDate: '2024-12-20',
        sevisId: 'N23456789',
        lastAction: 'SEVIS Approved',
        avatarUrl: undefined,
        initials: 'LM',
        profile: {} as Profile,
        firstName: 'Lukas',
        lastName: 'Müller',
        data: {}
      },
      {
        id: 'fallback-3',
        name: 'Sofia Garcia',
        country: 'Spain',
        grade: '11',
        gender: 'Female',
        program: 'Academic Year',
        partner: 'StudyAbroad',
        approvedOn: '03/10/2024',
        approvedBy: 'Jennifer Chen',
        status: { text: 'Approved', color: 'green' },
        applicationStatus: { text: 'Approved', color: 'green' },
        sevisStatus: { text: 'Ready for SEVIS', color: 'blue' },
        dob: '2006-08-23',
        hostFamilyName: 'Wilson Family',
        school: 'Roosevelt School',
        startDate: '2024-08-20',
        endDate: '2025-06-10',
        sevisId: 'N34567890',
        lastAction: 'Ready for SEVIS',
        avatarUrl: undefined,
        initials: 'SG',
        profile: {} as Profile,
        firstName: 'Sofia',
        lastName: 'Garcia',
        data: {}
      },
      {
        id: 'fallback-4',
        name: 'Yuki Tanaka',
        country: 'Japan',
        grade: '12',
        gender: 'Female',
        program: 'High School',
        partner: 'Global Exchange',
        approvedOn: '01/25/2024',
        approvedBy: 'Michael Thompson',
        status: { text: 'Rejected', color: 'red' },
        applicationStatus: { text: 'Rejected', color: 'red' },
        sevisStatus: null,
        dob: '2005-04-15',
        hostFamilyName: 'Brown Family',
        school: 'Washington High',
        startDate: '2024-08-05',
        endDate: '2025-06-20',
        sevisId: 'N45678901',
        lastAction: 'Application Rejected',
        avatarUrl: undefined,
        initials: 'YT',
        profile: {} as Profile,
        firstName: 'Yuki',
        lastName: 'Tanaka',
        data: {}
      },
      {
        id: 'fallback-5',
        name: 'Wei Zhang',
        country: 'China',
        grade: '9',
        gender: 'Male',
        program: 'Academic Year',
        partner: 'StudyAbroad',
        approvedOn: '02/05/2024',
        approvedBy: 'Emily Johnson',
        status: { text: 'Under Review', color: 'blue' },
        applicationStatus: { text: 'Under Review', color: 'blue' },
        sevisStatus: null,
        dob: '2008-12-01',
        hostFamilyName: 'Davis Family',
        school: 'Lincoln Academy',
        startDate: '2024-08-10',
        endDate: '2025-06-15',
        sevisId: 'N56789012',
        lastAction: 'Under Review',
        avatarUrl: undefined,
        initials: 'WZ',
        profile: {} as Profile,
        firstName: 'Wei',
        lastName: 'Zhang',
        data: {}
      }
    ];
    
    return fallbackStudents;
  };

  // Memoize processed students to prevent infinite re-renders
  const processedStudents = useMemo(() => {
    if (error) {
      console.error('Error loading data:', error);
      // Continue to create fallback data even if there's an error
    }
    
    try {
      // Helper for safe string access
      const safeString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value);
      };
      
      // Find student users
      const studentUsers = users.filter(user => user.role === 'student');
      
      if (studentUsers.length === 0) {
        return generateFallbackStudents();
      }
      
      // Create efficient lookup maps - do this once instead of repeated finds
      const profileByUserId = new Map(profiles.map(p => [p.userId, p]));
      const profileById = new Map(profiles.map(p => [p.id, p]));
      const userById = new Map(users.map(u => [u.id, u]));
      
      // Create relationship lookup maps
      const hostRelationshipsByStudentId = new Map(
        relationships
          .filter(r => r.type === 'host_student')
          .map(r => [r.secondaryId, r])
      );
      
      const orgRelationshipsByStudentId = new Map(
        relationships
          .filter(r => r.type === 'sending_org_student')
          .map(r => [r.secondaryId, r])
      );
      
      // Create processed students from real data if available
      let processedStudents: Student[] = [];
      
      if (studentUsers.length > 0) {
        // Process real student data
        processedStudents = studentUsers.map((studentUser, index) => {
          try {
            // Use efficient lookups instead of repeated find operations
            const studentProfile = profileByUserId.get(studentUser.id);
            
            // Find relevant relationships using efficient maps
            const hostRelationship = studentProfile 
              ? hostRelationshipsByStudentId.get(studentProfile.id)
              : null;
              
            const orgRelationship = studentProfile 
              ? orgRelationshipsByStudentId.get(studentProfile.id)
              : null;
            
            // Basic student info
            const firstName = safeString(studentUser.firstName);
            const lastName = safeString(studentUser.lastName);
            const name = `${firstName} ${lastName}`.trim() || `Student ${index + 1}`;
            
            // Safely extract metadata
            const country = studentUser.metadata?.country_of_origin || 'Unknown';
            const gender = studentUser.metadata?.gender || 
                           studentProfile?.data?.gender || 'Unknown';
            
            // Find host family using efficient lookups
            let hostFamilyName = 'Unassigned';
            if (hostRelationship) {
              const hostProfile = profileById.get(hostRelationship.primaryId);
              if (hostProfile) {
                const hostUser = userById.get(hostProfile.userId);
                if (hostUser) {
                  hostFamilyName = `${safeString(hostUser.firstName)} ${safeString(hostUser.lastName)}`.trim();
                  if (!hostFamilyName) hostFamilyName = 'Unassigned';
                }
              }
            }
            
            // Extract program details
            let programType = 'Unknown';
            if (orgRelationship?.data?.program_type) {
              programType = safeString(orgRelationship.data.program_type);
            } else if (studentProfile?.data?.program?.type) {
              programType = safeString(studentProfile.data.program.type);
            }
            
            // Format program name
            const programFormatted = programType.replace(/_/g, ' ')
              .split(' ')
              .map(word => word && word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            // Safe date handling
            const formatDate = (dateStr?: string): string => {
              if (!dateStr) return '-';
              try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return '-';
                return date.toLocaleDateString();
              } catch (e) {
                return '-';
              }
            };
            
            // Only show SEVIS ID for students who have successfully completed SEVIS processing
            let sevisId = '-';
            
            // First check if student has approved application status
            if (studentProfile?.data?.applicationStatus === 'approved') {
              // Then check if they have successfully completed SEVIS processing
              if (studentProfile?.data?.sevisStatus === 'sevis_approved') {
                // Only then show their actual SEVIS ID if it exists
                if (orgRelationship?.data && 
                    typeof orgRelationship.data === 'object' && 
                    'sevis_id' in orgRelationship.data &&
                    orgRelationship.data.sevis_id) {
                  sevisId = String(orgRelationship.data.sevis_id);
                } else {
                  sevisId = 'Pending assignment'; // They should have one but it's missing
                }
              } else {
                // Student is approved but hasn't completed SEVIS processing yet
                sevisId = '-';
              }
            }
            
            // Format approval date - check student profile data for approved_on field
            const approvalDate = (studentProfile?.data && 
                              typeof studentProfile.data === 'object' && 
                              'approved_on' in studentProfile.data)
              ? formatDate(studentProfile.data.approved_on as string)
              : '-';
            
            // Extract approved by information
            const approvedBy = (studentProfile?.data && 
                           typeof studentProfile.data === 'object' && 
                           'approved_by' in studentProfile.data &&
                           studentProfile.data.approved_by)
              ? String(studentProfile.data.approved_by)
              : '-';

            // Extract application status from profile data
            let applicationStatus = { text: 'Pending Review', color: 'amber' };
            let sevisStatus = null;
            
            const profileApplicationStatus = studentProfile?.data?.applicationStatus;
            const profileSevisStatus = studentProfile?.data?.sevisStatus;
            
            // Map application status
            if (profileApplicationStatus === 'approved') {
              applicationStatus = { text: 'Approved', color: 'green' };
            } else if (profileApplicationStatus === 'rejected') {
              applicationStatus = { text: 'Rejected', color: 'red' };
            } else if (profileApplicationStatus === 'under_review') {
              applicationStatus = { text: 'Under Review', color: 'blue' };
            } else if (profileApplicationStatus === 'pending_review') {
              applicationStatus = { text: 'Pending Review', color: 'amber' };
            }
            
            // Map SEVIS status (only for approved applications)
            if (profileApplicationStatus === 'approved' && profileSevisStatus) {
              if (profileSevisStatus === 'ready_for_sevis') {
                sevisStatus = { text: 'Ready for SEVIS', color: 'blue' };
              } else if (profileSevisStatus === 'in_sevis_queue') {
                sevisStatus = { text: 'In SEVIS Queue', color: 'amber' };
              } else if (profileSevisStatus === 'submitted_to_sevis') {
                sevisStatus = { text: 'Submitted to SEVIS', color: 'purple' };
              } else if (profileSevisStatus === 'sevis_approved') {
                sevisStatus = { text: 'SEVIS Approved', color: 'green' };
              } else if (profileSevisStatus === 'sevis_failed') {
                sevisStatus = { text: 'SEVIS Rejected', color: 'red' };
              }
            }

            // Generate random status for demo purposes if no data exists
            const statuses = [
              { text: 'Pending Review', color: 'amber' },
              { text: 'Approved', color: 'green' },
              { text: 'Rejected', color: 'red' },
              { text: 'Under Review', color: 'blue' }
            ];
            
            // Use application status as the main status for backward compatibility
            const mainStatus = applicationStatus;
            
            return {
              id: studentUser.id,
              name,
              country,
              grade: safeString(studentProfile?.data?.school_grade || ''),
              gender,
              program: programFormatted,
              partner: safeString(orgRelationship?.data?.partner_organization || ''),
              approvedOn: approvalDate,
              approvedBy: approvedBy,
              status: mainStatus, // For backward compatibility
              applicationStatus: applicationStatus,
              sevisStatus: sevisStatus,
              dob: formatDate(studentProfile?.data?.date_of_birth),
              hostFamilyName,
              school: safeString(orgRelationship?.data?.school_name || ''),
              startDate: formatDate(orgRelationship?.startDate?.toISOString()),
              endDate: formatDate(orgRelationship?.endDate?.toISOString()),
              sevisId,
              lastAction: 'Student Application Submitted',
              avatarUrl: studentUser.avatarUrl,
              initials: firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'ST',
              profile: studentProfile || {} as Profile,
              firstName,
              lastName,
              data: studentProfile?.data
            };
          } catch (err) {
            console.error(`Error processing student ${studentUser.id}:`, err);
            // Safe fallbacks for error case
            return {
              id: studentUser.id,
              name: studentUser.firstName ? `${studentUser.firstName} ${studentUser.lastName || ''}` : `Student ${index}`,
              country: 'Unknown',
              grade: 'Unknown',
              gender: 'Unknown',
              program: 'Unknown',
              partner: 'Unknown',
              approvedOn: '-',
              approvedBy: '-',
              status: { text: 'Error', color: 'red' },
              applicationStatus: { text: 'Error', color: 'red' },
              sevisStatus: null,
              dob: '-',
              hostFamilyName: 'Unassigned',
              school: 'Unknown',
              startDate: '-',
              endDate: '-',
              sevisId: '-',
              lastAction: 'Error Processing Student',
              avatarUrl: undefined,
              initials: 'ER',
              profile: {} as Profile,
              firstName: studentUser.firstName || '',
              lastName: studentUser.lastName || '',
              data: {}
            };
          }
        });
      }
      
      return processedStudents.length > 0 ? processedStudents : generateFallbackStudents();
    } catch (err) {
      console.error('Error processing students:', err);
      return generateFallbackStudents();
    }
  }, [users, profiles, relationships, error]); // Memoize based on actual data dependencies

  // Update state when processed students change
  useEffect(() => {
    setStudents(processedStudents);
    setIsViewLoading(false);
  }, [processedStudents]); // Only depend on the memoized processed students

  // Memoize enhanced students to prevent expensive re-calculations
  const enhancedStudents = useMemo(() => {
    // Map status text to more descriptive labels
    const getStatusLabel = (statusText: string) => {
      switch(statusText) {
        case 'Pending': return 'Pending';
        case 'Pending Review': return 'Pending Review';
        case 'Under Review': return 'Under Review';
        case 'Approved': return 'Approved';
        case 'Rejected': return 'Rejected';
        case 'Ready for SEVIS': return 'Ready for SEVIS';
        case 'In SEVIS Queue': return 'In SEVIS Queue';
        case 'Submitted to SEVIS': return 'Submitted to SEVIS';
        case 'SEVIS Approved': return 'SEVIS Approved';
        case 'SEVIS Rejected': return 'SEVIS Rejected';
        case 'Error': return 'Error';
        default: return statusText;
      }
    };
    
    return students.map(student => {
      // Get the status text for backward compatibility
      const statusText = student.applicationStatus?.text || student.status?.text || '';
      const applicationStatusText = student.applicationStatus?.text || '';
      const sevisStatusText = student.sevisStatus?.text || '';
      
      // Create enhanced student with additional properties
      return {
        ...student,
        // Create a flattened version of the status for filtering
        statusText: statusText,
        // Create a descriptive status label for display
        statusDisplay: getStatusLabel(statusText),
        // Add separate status text fields for filtering
        applicationStatusText: applicationStatusText,
        sevisStatusText: sevisStatusText
      };
    });
  }, [students]); // Only recalculate when students change

  // Define columns with a simpler approach to avoid TypeScript stack depth issues
  const tableColumns = useMemo((): any[] => {
    const columns = [
      {
        id: "select",
        enablePinning: true,
        enableSorting: false,
        size: 56,
        header: ({ table }: any) => (
          <div className="flex h-10 items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="flex h-10 items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`Select row ${row.index}`}
            />
          </div>
        ),
      },
      {
        id: "expander",
        enablePinning: true,
        enableSorting: false,
        size: 56,
        header: "Details",
        cell: ({ row }: any) => (
          <div className="flex h-full w-full items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex items-center justify-center"
              onClick={() => row.toggleExpanded()}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", {
                "transform -rotate-90": !row.getIsExpanded(),
              })} />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        enablePinning: true,
        enableSorting: true,
        size: 220,
        cell: ({ row }: any) => {
          const student = row.original;
          // Only show SEVIS ID if the student actually has one (not "-" or "Pending assignment")
          const showSevisId = student.sevisId && student.sevisId !== '-' && student.sevisId !== 'Pending assignment';
          
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center text-xs relative overflow-hidden">
                {student.avatarUrl ? (
                  <>
                    <img
                      src={student.avatarUrl}
                      alt={`${student.name}`}
                      className="h-8 w-8 rounded-[0.5rem] absolute inset-0 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <span className="text-xs font-medium" style={{ display: 'none' }}>
                      {student.initials}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium">{student.initials}</span>
                )}
              </div>
              <div className={`flex ${showSevisId ? 'flex-col' : 'items-center'} min-w-0`}>
                <span className="font-medium truncate">{student.name}</span>
                {showSevisId && (
                  <span className="text-xs text-gray-500 truncate">{student.sevisId}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "program",
        header: "Program",
        size: 160,
        enableSorting: true,
      },
      {
        accessorKey: "partner",
        header: "Partner",
        size: 160,
        enableSorting: true,
      },
      {
        accessorKey: "approvedOn",
        header: "Approved On",
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "approvedBy", 
        header: "Approved By",
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => {
          const student = row.original;
          const approvedBy = student.approvedBy;
          
          // Only show approved by for approved or rejected applications
          if (student.applicationStatus?.text === 'Approved' || student.applicationStatus?.text === 'Rejected') {
            return (
              <span className="text-sm">{approvedBy !== 'Unknown' ? approvedBy : '-'}</span>
            );
          }
          
          return <span className="text-sm text-gray-400">-</span>;
        },
      },
      {
        accessorKey: "hostFamilyName",
        header: "Host Family",
        size: 180,
        enableSorting: true,
      },
      {
        accessorKey: "school",
        header: "School",
        size: 220,
        enableSorting: true,
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        size: 140,
        enableSorting: true,
      },
      {
        accessorKey: "applicationStatus",
        header: "Application Status",
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => {
          const student = row.original;
          const status = student.applicationStatus;
          
          return (
            <Badge
              variant={
                status.color === 'amber' ? 'chip-amber' : 
                status.color === 'green' ? 'chip-green' : 
                status.color === 'blue' ? 'chip-blue' : 
                status.color === 'red' ? 'chip-red' :
                status.color === 'purple' ? 'chip-purple' :
                'chip-gray'
              }
            >
              {status.text}
            </Badge>
          );
        },
      },
      {
        accessorKey: "sevisStatus",
        header: "SEVIS Status",
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => {
          const student = row.original;
          const sevisStatus = student.sevisStatus;
          
          // Only show SEVIS status for approved applications
          if (!sevisStatus || student.applicationStatus?.text !== 'Approved') {
            return <span className="text-sm text-gray-400">-</span>;
          }
          
          return (
            <Badge
              variant={
                sevisStatus.color === 'amber' ? 'chip-amber' : 
                sevisStatus.color === 'green' ? 'chip-green' : 
                sevisStatus.color === 'blue' ? 'chip-blue' : 
                sevisStatus.color === 'red' ? 'chip-red' :
                sevisStatus.color === 'purple' ? 'chip-purple' :
                'chip-gray'
              }
            >
              {sevisStatus.text}
            </Badge>
          );
        },
      },
             createActionsColumn([
        {
          label: "View Profile",
          icon: UserCircle,
          onClick: (student) => {}
        },
        {
          label: "Edit Student",
          icon: FileEdit,
          onClick: (student) => {}
        },
        {
          label: "View DS-2019",
          icon: FileText,
          onClick: (student) => {}
        },
        {
          label: "Contact Student",
          icon: Send,
          onClick: (student) => {}
        },
        {
          label: "Manage School",
          icon: School,
          onClick: (student) => {}
        },
        {
          label: "Change Host Family",
          icon: Home,
          onClick: (student) => {}
        },
        {
          label: "View Reports",
          icon: FileBarChart,
          onClick: (student) => {}
        },
        {
          label: "Update Status",
          icon: Tag,
          onClick: (student) => {}
        }
      ])
    ];
    
    return columns;
  }, []);

  // Add a condition to check for no students only after loading is complete
      if (students.length === 0 && !error && !isViewLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>No students found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No students were found in the system.</p>
              <Button>Add Student</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-md flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-medium">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
          <div className="text-xs text-gray-500">
            {usedFallback ? "Using fallback mock data" : ""}
            {usingServiceClient ? "Using service client bypass" : "Using standard client"}
          </div>
          <Button variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Overview</CardTitle>
          <CardDescription>Student status and key metrics for FY 2024 - 2025</CardDescription>
          {usedFallback && (
            <div className="mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-md inline-block">
              Using fallback mock data
            </div>
          )}
          {usingServiceClient && (
            <div className="mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md inline-block">
              Using service client bypass
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Calculate counts by status */}
          {(() => {
            const totalStudents = students.length;
            
            // Get counts for each application status type
            const pendingReviewCount = students.filter(s => s.applicationStatus?.text === 'Pending Review').length;
            const underReviewCount = students.filter(s => s.applicationStatus?.text === 'Under Review').length;
            const approvedCount = students.filter(s => s.applicationStatus?.text === 'Approved').length;
            const rejectedCount = students.filter(s => s.applicationStatus?.text === 'Rejected').length;
            
            // Get counts for SEVIS status (only for approved students)
            const readyForSevisCount = students.filter(s => 
              s.applicationStatus?.text === 'Approved' && s.sevisStatus?.text === 'Ready for SEVIS'
            ).length;
            const inSevisQueueCount = students.filter(s => 
              s.applicationStatus?.text === 'Approved' && s.sevisStatus?.text === 'In SEVIS Queue'
            ).length;
            const sevisApprovedCount = students.filter(s => 
              s.applicationStatus?.text === 'Approved' && s.sevisStatus?.text === 'SEVIS Approved'
            ).length;
            
            // Calculate percentages
            const pendingReviewPercent = totalStudents ? Math.round((pendingReviewCount / totalStudents) * 100) : 0;
            const approvedPercent = totalStudents ? Math.round((approvedCount / totalStudents) * 100) : 0;
            const readyForSevisPercent = approvedCount ? Math.round((readyForSevisCount / approvedCount) * 100) : 0;
            
            return (
              <Metrics metrics={[
                {
                  title: "Total Students",
                  value: totalStudents,
                  icon: Users,
                  variant: "success",
                  change: { value: 5.2, timeframe: "from last year", type: "increase" }
                },
                {
                  title: "Pending Review",
                  value: pendingReviewCount,
                  icon: Clock,
                  variant: "warning",
                  change: { value: 3, timeframe: "from last month", type: "decrease" },
                  unit: `${pendingReviewPercent}% of total`
                },
                {
                  title: "Approved",
                  value: approvedCount,
                  icon: CheckCircle,
                  variant: "success",
                  change: { value: 2, timeframe: "from last month", type: "increase" },
                  unit: `${approvedPercent}% of total`
                },
                {
                  title: "Ready for SEVIS",
                  value: readyForSevisCount,
                  icon: FileCheck,
                  variant: "info",
                  change: { value: 1, timeframe: "from last month", type: "increase" },
                  unit: `${readyForSevisPercent}% of total`
                }
              ]} />
            );
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Manage exchange students and their SEVIS application status</CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedPinnedTable
            data={enhancedStudents}
            columns={tableColumns}
            defaultPinnedColumns={{
              left: ['select', 'expander', 'name'],
              right: ['actions']
            }}
            defaultSorting={[{ id: 'name', desc: false }]}
            enableSearch={true}
            searchPlaceholder="Search Name or SEVIS ID..."
            searchFunction={(student: any, query: string) => {
              const lowerQuery = query.toLowerCase();
              // Only show SEVIS ID if the student actually has one (not "-" or "Pending assignment")
              const showSevisId = student.sevisId && student.sevisId !== '-' && student.sevisId !== 'Pending assignment';
              
              // Basic name search
              const nameMatch = Boolean(student.name && student.name.toLowerCase().includes(lowerQuery));
              
              // SEVIS ID search - only for approved students
              const sevisMatch = showSevisId && student.sevisId ? student.sevisId.toLowerCase().includes(lowerQuery) : false;
              
              // Search in other potentially useful fields
              const countryMatch = student.country ? student.country.toLowerCase().includes(lowerQuery) : false;
              const programMatch = student.program ? student.program.toLowerCase().includes(lowerQuery) : false;
              const schoolMatch = student.school ? student.school.toLowerCase().includes(lowerQuery) : false;
              const hostFamilyMatch = student.hostFamilyName ? student.hostFamilyName.toLowerCase().includes(lowerQuery) : false;
              
              // Check for a match in any searchable field
              return nameMatch || sevisMatch || countryMatch || programMatch || schoolMatch || hostFamilyMatch;
            }}
            enableStatusFilter={true}
            statusFilters={[
              {
                id: "pending-review",
                label: "Pending Review",
                value: "Pending Review",
                field: "applicationStatusText",
                color: "amber",
                count: students.filter(s => s?.applicationStatus?.text === 'Pending Review').length
              },
              {
                id: "under-review",
                label: "Under Review",
                value: "Under Review",
                field: "applicationStatusText",
                color: "blue",
                count: students.filter(s => s?.applicationStatus?.text === 'Under Review').length
              },
              {
                id: "approved",
                label: "Approved",
                value: "Approved",
                field: "applicationStatusText",
                color: "green",
                count: students.filter(s => s?.applicationStatus?.text === 'Approved').length
              },
              {
                id: "rejected",
                label: "Rejected",
                value: "Rejected", 
                field: "applicationStatusText",
                color: "red",
                count: students.filter(s => s?.applicationStatus?.text === 'Rejected').length
              }
            ]}
            enableFilters={true}
            filterOptions={[
              {
                id: "country-filter", 
                label: "Country",
                field: "country",
                options: enhancedStudents.reduce((acc, student) => {
                  if (student.country && !acc.find(opt => opt.value === student.country)) {
                    acc.push({ label: student.country, value: student.country });
                  }
                  return acc;
                }, [] as { label: string; value: string }[]).sort((a, b) => a.label.localeCompare(b.label))
              },
              {
                id: "program-filter",
                label: "Program",
                field: "program",
                options: Array.from(new Set(students.map(s => s.program)))
                  .filter(program => program)
                  .sort()
                  .map(program => ({
                    label: program,
                    value: program
                  }))
              }
            ]}
            bulkActions={[
              {
                label: "Send Email",
                onClick: (rows: any[]) => {
                  // Implement email sending logic
                }
              },
              {
                label: "Export Data",
                onClick: (rows: any[]) => {
                  // Implement export logic
                }
              },
              {
                label: "Update Status",
                onClick: (rows: any[]) => {
                  // Implement status update logic
                }
              }
            ]}
            expandedViewType="student"
            virtualScrolling={{
              enabled: true,
              rowHeight: 60,
              maxHeight: 600,
              overscan: 10,
              threshold: 50
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 