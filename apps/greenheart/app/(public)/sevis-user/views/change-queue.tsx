'use client'

import { Button } from "@repo/ui/components/ui/button"
import { AdvancedPinnedTable } from "@repo/ui/components/ui/advanced-pinned-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { useState, useEffect } from "react"
import { 
  ChevronDown, 
  MoreHorizontal, 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowRightCircle, 
  UserCog, 
  FileText, 
  History, 
  MessageSquare, 
  FileCheck, 
  AlertCircle, 
  Calendar, 
  User 
} from "lucide-react"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@repo/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { Metrics } from "@repo/ui/components/ui/metrics"
import { Badge } from "@repo/ui/components/ui/badge"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Separator } from "@repo/ui/components/ui/separator"
import { Input } from "@repo/ui/components/ui/input"
import { ChangeQueueExpandedView } from "@repo/ui/components/templates/table-expanded-views/change-queue-expanded-view"
import { db, adminDb } from '@repo/database'
import { useMounted } from '@/lib/useMounted'

interface ChangeItem {
  id: string
  fieldPath: string
  fieldLabel: string
  previousValue: string | null
  newValue: string
  changeType: 'create' | 'update' | 'delete'
  isSevisRelated: boolean
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  sevisBatchId?: string
  comments: ChangeComment[]
}

interface ChangeComment {
  id: string
  authorId: string
  authorName: string
  content: string
  isInternal: boolean
  createdAt: string
}

interface ChangeRequest {
  id: string
  recordType: 'student' | 'host_family' | 'coordinator'
  recordId: string
  recordName: string
  requestedBy: string
  requestedByName: string
  requestDate: string
  status: 'pending' | 'partially_approved' | 'fully_approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  changeItems: ChangeItem[]
  metadata?: {
    source?: string
    urgencyReason?: string
  }
}

// Simplified fallback data for when InstantDB is unavailable
const generateFallbackChangeRequests = (): ChangeRequest[] => {
  const studentNames = [
    'Emma Schmidt', 'Lukas Müller', 'Sofia Garcia', 'Yuki Tanaka', 'Wei Zhang',
    'Hans Weber', 'Anna Kowalski', 'Pierre Dubois', 'Sakura Yamamoto', 'Li Chen'
  ] as const;

  const hostFamilyNames = [
    'The Johnson Family', 'The Smith Family', 'The Williams Family', 'The Brown Family',
    'The Davis Family', 'The Miller Family', 'The Wilson Family', 'The Anderson Family'
  ] as const;

  const coordinatorNames = [
    'Michael Wilson', 'Sarah Davis', 'James Thompson', 'Emily Rodriguez',
    'David Chen', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'
  ] as const;

  return [
    {
      id: "fallback-1",
      recordType: "student",
      recordId: "student-1",
      recordName: studentNames[0],
      requestedBy: "user-1",
      requestedByName: "Jane Smith",
      requestDate: "2024-03-01",
      status: "pending",
      priority: "high",
      description: "Student address change due to host family relocation",
      changeItems: [
        {
          id: "item-1",
          fieldPath: "data.address",
          fieldLabel: "Address",
          previousValue: "123 Main Street, Springfield, IL 62701",
          newValue: "456 Oak Avenue, Madison, WI 53703",
          changeType: "update",
          isSevisRelated: true,
          status: "pending",
          comments: []
        }
      ],
      metadata: {
        source: "user_request",
        urgencyReason: "SEVIS deadline approaching"
      }
    },
    {
      id: "fallback-2",
      recordType: "host_family",
      recordId: "hf-1",
      recordName: hostFamilyNames[0],
      requestedBy: "user-2",
      requestedByName: coordinatorNames[0],
      requestDate: "2024-03-02",
      status: "fully_approved",
      priority: "medium",
      description: "Update host family contact information",
      changeItems: [
        {
          id: "item-2",
          fieldPath: "data.email_primary",
          fieldLabel: "Primary Email",
          previousValue: "old.email@example.com",
          newValue: "new.email@example.com",
          changeType: "update",
          isSevisRelated: false,
          status: "approved",
          approvedBy: "Admin User",
          approvedAt: "2024-03-02T16:45:00Z",
          comments: []
        }
      ]
    },
    {
      id: "fallback-3",
      recordType: "coordinator",
      recordId: "coord-1",
      recordName: coordinatorNames[1],
      requestedBy: "user-3",
      requestedByName: "Admin User",
      requestDate: "2024-03-03",
      status: "partially_approved",
      priority: "low",
      description: "Update coordinator service region",
      changeItems: [
        {
          id: "item-3",
          fieldPath: "data.service_region",
          fieldLabel: "Service Region",
          previousValue: "Wisconsin",
          newValue: "Wisconsin, Minnesota",
          changeType: "update",
          isSevisRelated: false,
          status: "approved",
          approvedBy: "Admin User",
          approvedAt: "2024-03-03T10:00:00Z",
          comments: []
        },
        {
          id: "item-4",
          fieldPath: "data.max_students",
          fieldLabel: "Maximum Students",
          previousValue: "10",
          newValue: "15",
          changeType: "update",
          isSevisRelated: false,
          status: "pending",
          comments: []
        }
      ]
    }
  ];
};

// Custom hook to fetch change queue data from InstantDB
function useChangeQueueData() {
  const [usedFallback, setUsedFallback] = useState(false)

  // Check if InstantDB client is available
  if (!db) {
    console.warn('InstantDB client not available - using fallback data');
    return {
      changeRequests: generateFallbackChangeRequests(),
      isLoading: false,
      error: 'InstantDB client not available - check your environment variables',
      refetch: () => {},
      usedFallback: true
    }
  }

  try {
    // Use InstantDB's reactive query system
    const result = db.useQuery({
      changeQueue: {}
    })

    // Extract data from the result
    const { data, isLoading, error: queryError } = result

    if (queryError) {
      console.error('InstantDB query error:', queryError)
      return {
        changeRequests: generateFallbackChangeRequests(),
        isLoading: false,
        error: queryError.message || 'Failed to load data from InstantDB',
        refetch: () => {},
        usedFallback: true
      }
    }

    // Debug logging
    // InstantDB data loaded

    // Transform the data to match our interface
    const transformedRequests: ChangeRequest[] = (data?.changeQueue || []).map((request: any) => {
      // Extract data from the InstantDB structure
      const requestData = request.requestData || {};
      const changeItems = requestData.changeItems || [];
      
      return {
        id: request.id,
        recordType: requestData.recordType || request.entityType || 'student',
        recordId: request.entityId || '',
        recordName: requestData.recordName || 'Unknown',
        requestedBy: request.requestedBy || '',
        requestedByName: requestData.requestedByName || 'Unknown User',
        requestDate: request.createdAt || new Date().toISOString(),
        status: request.status || 'pending',
        priority: request.priority || 'medium',
        description: requestData.description || '',
        metadata: requestData.metadata || {},
        changeItems: changeItems.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          fieldPath: item.fieldPath || '',
          fieldLabel: item.fieldLabel || '',
          previousValue: item.previousValue,
          newValue: item.newValue || '',
          changeType: item.changeType || 'update',
          isSevisRelated: item.isSevisRelated || false,
          status: item.status || 'pending',
          approvedBy: item.approvedBy,
          approvedAt: item.approvedAt,
          rejectionReason: item.rejectionReason,
          sevisBatchId: item.sevisBatchId,
          comments: (item.comments || []).map((comment: any) => ({
            id: comment.id || crypto.randomUUID(),
            authorId: comment.authorId || '',
            authorName: comment.authorName || 'Unknown',
            content: comment.content || '',
            isInternal: comment.isInternal || false,
            createdAt: comment.createdAt || new Date().toISOString()
          }))
        }))
      }
    })

    // Only use fallback if there's truly no data and we're not loading
    if ((!data?.changeQueue || data.changeQueue.length === 0) && !isLoading) {
      console.warn('No changeQueue data found, using fallback');
      return {
        changeRequests: generateFallbackChangeRequests(),
        isLoading: false,
        error: null,
        refetch: () => {},
        usedFallback: true
      }
    }

    // Return real data
    return {
      changeRequests: transformedRequests,
      isLoading: isLoading || false,
      error: null,
      refetch: () => {
        // For InstantDB, refetching is automatic due to reactive queries
      },
      usedFallback: false
    }
  } catch (err) {
    console.error('Error with InstantDB query:', err)
    return {
      changeRequests: generateFallbackChangeRequests(),
      isLoading: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      refetch: () => {},
      usedFallback: true
    }
  }
}

// Define props for the component
interface ChangeQueueViewProps {}

export function ChangeQueueView({}: ChangeQueueViewProps = {}) {
  const { changeRequests, isLoading, error, usedFallback } = useChangeQueueData()
  const mounted = useMounted()

  const columns: any[] = [
    {
      id: "select",
      enablePinning: true,
      enableSorting: false,
      size: 40,
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
      size: 40,
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
      id: "changeCount",
      header: "No. of Changes",
      size: 120,
      enableSorting: true,
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.changeItems.length} {row.original.changeItems.length === 1 ? 'change' : 'changes'}
        </div>
      ),
      sortingFn: (rowA: any, rowB: any) => {
        return rowA.original.changeItems.length - rowB.original.changeItems.length;
      },
    },
    {
      accessorKey: "recordName",
      header: "Record Name",
      enablePinning: true,
      enableSorting: true,
      size: 180,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center text-xs">
            {row.original.recordName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{row.original.recordName}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "recordType",
      header: "Record Type",
      size: 140,
      enableSorting: true,
      cell: ({ row }: any) => (
        <Badge variant={
          row.original.recordType === 'student' ? 'chip-blue' :
          row.original.recordType === 'host_family' ? 'chip-green' : 'chip-purple'
        }>
          {row.original.recordType === 'host_family' ? 'Host Family' : 
           row.original.recordType === 'coordinator' ? 'Local Coordinator' : 'Student'}
        </Badge>
      ),
    },
    {
      accessorKey: "requestDate",
      header: "Request Date",
      size: 120,
      enableSorting: true,
      cell: ({ row }: any) => (
        <div className="text-sm">
          {new Date(row.original.requestDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 140,
      enableSorting: true,
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = 
          status === 'fully_approved' ? 'chip-green' :
          status === 'partially_approved' ? 'chip-blue' :
          status === 'pending' ? 'chip-amber' : 
          status === 'rejected' ? 'chip-red' : 'chip-gray';
        
        return (
          <Badge variant={variant}>
            {status === 'fully_approved' ? 'Fully Approved' :
             status === 'partially_approved' ? 'Partially Approved' :
             status === 'pending' ? 'Pending' : 
             status === 'rejected' ? 'Rejected' : status}
          </Badge>
        );
      },
    },
    {
      id: "sevis_items",
      header: "SEVIS",
      size: 80,
      cell: ({ row }: any) => {
        const sevisItems = row.original.changeItems.filter((item: any) => item.isSevisRelated && item.status === 'pending');
        if (sevisItems.length === 0) return null;
        
        return (
          <div className="flex items-center gap-1">
            <FileCheck className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">{sevisItems.length}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enablePinning: true,
      size: 100,
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve All Changes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Request
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Process SEVIS Items
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                Assign Reviewer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Flag as Priority
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View Documents
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Calculate metrics
  const totalItems = changeRequests.reduce((sum, req) => sum + req.changeItems.length, 0);
  const pendingItems = changeRequests.reduce((sum, req) => 
    sum + req.changeItems.filter(item => item.status === 'pending').length, 0);
  const sevisItems = changeRequests.reduce((sum, req) => 
    sum + req.changeItems.filter(item => item.isSevisRelated && item.status === 'approved').length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Queue Overview</CardTitle>
          <CardDescription>
            Track and manage change requests for students, host families, and local coordinators
            {usedFallback && (
              <span className="text-amber-600 ml-2">(Using fallback data)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Total Changes",
              value: mounted ? totalItems : 0,
              icon: ClipboardList,
              variant: "info",
              unit: "Individual changes"
            },
            {
              title: "Pending Review",
              value: mounted ? pendingItems : 0,
              icon: Clock,
              variant: "warning",
              unit: "Awaiting approval"
            },
            {
              title: "SEVIS Ready",
              value: mounted ? sevisItems : 0,
              icon: FileCheck,
              variant: "success",
              unit: "Ready for batch"
            }
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Request Queue</CardTitle>
          <CardDescription>Process and track change requests with individual change approval</CardDescription>
        </CardHeader>
        <CardContent>
                                  <AdvancedPinnedTable
            data={changeRequests}
            columns={columns}
            defaultPinnedColumns={{
              left: ['select', 'expander', 'recordName', 'recordType'],
              right: ['actions']
            }}
            defaultSorting={[
              { id: 'requestDate', desc: true }
            ]}
            enableSearch={true}
            searchPlaceholder="Search requests..."
            searchFunction={(request, query) => {
              const lowerQuery = query.toLowerCase();
              return (
                request.recordName.toLowerCase().includes(lowerQuery) ||
                request.requestedByName.toLowerCase().includes(lowerQuery) ||
                request.changeItems.some(item => 
                  item.fieldLabel.toLowerCase().includes(lowerQuery)
                )
              );
            }}
            enableStatusFilter={true}
            statusFilters={[
              {
                id: "pending",
                label: "Pending",
                value: "pending",
                field: "status",
                color: "amber",
                showNotification: true
              },
              {
                id: "partially_approved",
                label: "Partially Approved",
                value: "partially_approved",
                field: "status",
                color: "blue"
              },
              {
                id: "fully_approved",
                label: "Fully Approved",
                value: "fully_approved",
                field: "status",
                color: "green"
              }
            ]}
            enableFilters={true}
            filterOptions={[
              {
                id: "record-type-filter",
                label: "Record Type",
                field: "recordType",
                options: [
                  { label: "Student", value: "student" },
                  { label: "Host Family", value: "host_family" },
                  { label: "Local Coordinator", value: "coordinator" }
                ]
              }
            ]}
            bulkActions={[
              {
                label: "Approve All Changes",
                onClick: (rows) => {}
              },
              {
                label: "Process SEVIS Items",
                onClick: (rows) => {}
              }
            ]}
            getRowNotification={(row, index) => {
              // Show notification indicators on the 5 most recently updated records
              // Since the table is sorted by requestDate (desc), the first 5 rows are the most recent
              return index < 5;
            }}
            renderExpandedContent={({ row }: any) => (
              <ChangeQueueExpandedView row={row} containerWidth={0} />
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
} 