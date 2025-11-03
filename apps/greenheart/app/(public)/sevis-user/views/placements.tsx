'use client'

import { Button } from "@repo/ui/components/ui/button"
import { AdvancedPinnedTable } from "@repo/ui/components/ui/advanced-pinned-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { useState, useEffect } from "react"
import { Search, Calendar, Building2, CheckCircle, Clock, MoreHorizontal, ChevronDown, AlertTriangle } from "lucide-react"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@repo/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { Metrics } from "@repo/ui/components/ui/metrics"
import { db } from "@repo/database"
import { useInstantData } from "@/lib/useInstantData"
import { useMounted } from "@/lib/useMounted"

interface Placement {
  id: string
  studentName: string
  hostFamily: string
  school: string
  startDate: string
  endDate: string
  status: string
}

// Define props for the component
interface PlacementsViewProps {}

export function PlacementsView({}: PlacementsViewProps = {}) {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [isViewLoading, setIsViewLoading] = useState(true)
  const mounted = useMounted()
  
  // Use the same pattern as students view
  const { users, profiles, relationships, error } = useInstantData();
  
  // Also try direct InstantDB query for placements
  const placementsResult = db ? db.useQuery({
    placements: {}
  }) : { data: null, isLoading: false, error: null };
  
  // Type-safe profiles casting
  const typedProfiles = profiles as any[];

  // Process placement data from InstantDB

  // Process placement data from InstantDB
  useEffect(() => {
    try {
      setIsViewLoading(true);
      
      if (error) {
        console.error('InstantData error:', error)
        // Don't return early, try to use direct placements data
      }

      if (!placementsResult.data?.placements || placementsResult.data.placements.length === 0) {
        setPlacements([])
        setIsViewLoading(false)
        return
      }

      // Transform InstantDB placement data to our interface
      const transformedPlacements = placementsResult.data.placements.map((placement: any) => {
        // Get student profile by ID
        const studentProfile = typedProfiles.find(p => p.id === placement.studentProfileId)
        
        // Get student name from profile data
        let studentName = 'Unknown Student'
        if (studentProfile?.data) {
          const profileData = studentProfile.data as any
          const firstName = profileData.first_name ?? profileData.firstName ?? ''
          const lastName = profileData.last_name ?? profileData.lastName ?? ''
          studentName = `${firstName} ${lastName}`.trim() || 'Unknown Student'
        }

        // Get host family profile by ID
        const hostProfile = typedProfiles.find(p => p.id === placement.hostFamilyProfileId)
        
        // Get host family name from profile data - access individual parent names
        let hostFamily = 'Unknown Host'
        if (hostProfile?.data) {
          const profileData = hostProfile.data as any
          
          // Try to get parent names from host family structure
          const primaryHost = profileData.primary_host
          const secondaryHost = profileData.secondary_host
          
          if (primaryHost) {
            const primaryName = `${primaryHost.first_name || ''} ${primaryHost.last_name || ''}`.trim()
            
            if (secondaryHost) {
              const secondaryName = `${secondaryHost.first_name || ''} ${secondaryHost.last_name || ''}`.trim()
              hostFamily = secondaryName ? `${primaryName} & ${secondaryName}` : primaryName
            } else {
              hostFamily = primaryName
            }
          } else {
            // Fallback to user-level names if primary_host structure not available
            const firstName = profileData.first_name ?? profileData.firstName ?? ''
            const lastName = profileData.last_name ?? profileData.lastName ?? ''
            const hostName = `${firstName} ${lastName}`.trim()
            hostFamily = hostName || 'Unknown Host'
          }
        }

        // Format dates - handle both string and Date types
        const formatDate = (dateValue: any): string => {
          if (!dateValue) return 'Unknown'
          try {
            const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
            return date.toISOString().split('T')[0] ?? 'Unknown'
          } catch {
            return 'Unknown'
          }
        }
        
        const startDate = formatDate(placement.startDate)
        const endDate = formatDate(placement.endDate)

        // Map status values
        let displayStatus = 'Pending'
        if (placement.status === 'active') {
          displayStatus = 'Confirmed'
        } else if (placement.status === 'completed') {
          displayStatus = 'Completed'
        } else if (placement.status === 'terminated') {
          displayStatus = 'Cancelled'
        }

        const result = {
          id: placement.id,
          studentName,
          hostFamily,
          school: placement.school || 'Unassigned',
          startDate,
          endDate,
          status: displayStatus
        }
        

        return result
      })


      setPlacements(transformedPlacements)
    } catch (e) {
      console.error('Failed to process placement data:', e)
      setPlacements([])
    } finally {
      setIsViewLoading(false)
    }
  }, [placementsResult.data, typedProfiles, error])

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
              "transform -rotate-90": !row.getIsExpanded()
            })} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
      enablePinning: true,
      enableSorting: true,
      size: 180,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center text-xs">
            {row.original.studentName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{row.original.studentName}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "hostFamily",
      header: "Host Family",
      size: 180,
      enableSorting: true,
    },
    {
      accessorKey: "school",
      header: "School",
      size: 180,
      enableSorting: true,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      enableSorting: true,
      cell: ({ row }: any) => (
        <span className={cn(
          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
          row.original.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
          row.original.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        )}>
          {row.original.status}
        </span>
      ),
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
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="bg-white p-8 rounded-md flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium">Error</h3>
          <p className="text-sm text-red-500">Error loading data: {error}</p>
        </div>
      </div>
    )
  }

      if (placements.length === 0 && !error && !isViewLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Placements</CardTitle>
            <CardDescription>No placements found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No placements were found in the system.</p>
              <Button>Add Placement</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placements Overview</CardTitle>
          <CardDescription>Status and key metrics for student placements</CardDescription>
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Total Placements",
              value: mounted ? placements.length : 0,
              icon: Search,
              variant: "success",
              unit: "Student placements"
            },
            {
              title: "Confirmed",
              value: mounted ? placements.filter(p => p.status === 'Confirmed').length : 0,
              icon: CheckCircle,
              variant: "info",
              unit: mounted ? `${Math.round((placements.filter(p => p.status === 'Confirmed').length / (placements.length || 1)) * 100)}% of total` : "0% of total"
            },
            {
              title: "Pending",
              value: mounted ? placements.filter(p => p.status === 'Pending').length : 0,
              icon: Clock,
              variant: "warning",
              unit: mounted ? `${Math.round((placements.filter(p => p.status === 'Pending').length / (placements.length || 1)) * 100)}% of total` : "0% of total"
            },
            {
              title: "Schools",
              value: mounted ? new Set(placements.map(p => p.school).filter(Boolean)).size : 0,
              icon: Building2,
              variant: "purple",
              unit: "Participating schools"
            }
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Placements</CardTitle>
          <CardDescription>Manage student placements with host families and schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end gap-4 mb-6">
            <Button>Add Placement</Button>
          </div>

                                  <AdvancedPinnedTable
            data={placements}
            columns={columns}
            defaultPinnedColumns={{
              left: ['select', 'expander', 'studentName'],
              right: ['actions']
            }}
            defaultSorting={[{ id: 'studentName', desc: false }]}
            enableSearch={true}
            searchPlaceholder="Search by student, host family, or school..."
            searchFunction={(placement, query) => {
              const lowerQuery = query.toLowerCase();
              return (
                placement.studentName.toLowerCase().includes(lowerQuery) || 
                placement.hostFamily.toLowerCase().includes(lowerQuery) ||
                placement.school.toLowerCase().includes(lowerQuery)
              );
            }}
            enableStatusFilter={true}
            statusFilters={[
              {
                id: "confirmed",
                label: "Confirmed",
                value: "Confirmed",
                field: "status",
                color: "green"
              },
              {
                id: "pending",
                label: "Pending",
                value: "Pending",
                field: "status",
                color: "amber"
              },
              {
                id: "completed",
                label: "Completed",
                value: "Completed",
                field: "status",
                color: "blue"
              },
              {
                id: "cancelled",
                label: "Cancelled",
                value: "Cancelled",
                field: "status",
                color: "red"
              }
            ]}
            enableFilters={true}
            filterOptions={[
              {
                id: "school-filter",
                label: "School",
                field: "school",
                options: Array.from(new Set(placements.map(p => p.school)))
                  .filter(school => school && school !== 'Unassigned')
                  .sort()
                  .map(school => ({
                    label: school,
                    value: school
                  }))
              }
            ]}
            renderExpandedContent={({ row }: any) => (
              <div className="sticky left-0 right-0 bg-muted/50 expanded-content-div shadow-[inset_0px_2px_4px_oklch(20.99130133%_0.034134981_263.4360409_/_0.06),inset_0px_4px_8px_oklch(20.99130133%_0.034134981_263.4360409_/_0.1)]">
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div>
                    <h4 className="font-medium mb-2">Student Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>Name: {row.original.studentName}</p>
                      <p>Program: Academic Year</p>
                      <p>Home Country: Germany</p>
                      <p>Grade Level: 11</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Placement Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>Host Family: {row.original.hostFamily}</p>
                      <p>School: {row.original.school}</p>
                      <p>Status: {row.original.status}</p>
                      <p>Location: Portland, OR</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Dates</h4>
                    <div className="space-y-1 text-sm">
                      <p>Start Date: {row.original.startDate}</p>
                      <p>End Date: {row.original.endDate}</p>
                      <p>Duration: 10 months</p>
                      <p>Placement Created: 01/15/2024</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
} 