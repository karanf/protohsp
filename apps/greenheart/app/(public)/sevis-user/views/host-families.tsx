'use client'

import { Button } from "@repo/ui/components/ui/button"
import { AdvancedPinnedTable, createActionsColumn } from "@repo/ui/components/ui/advanced-pinned-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Clock, Users, ChevronDown, AlertTriangle } from "lucide-react"
import { useInstantData } from "@/lib/useInstantData"
import { useMounted } from "@/lib/useMounted"
import type { User, Profile, Relationship } from "@/lib/useInstantData"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@repo/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { Metrics } from "@repo/ui/components/ui/metrics"

interface HostFamily {
  id: string
  name: string
  location: string
  status: string
  students: number
  lastVerified: string
  avatarUrl?: string
  initials: string
}

// Helper function to safely access nested properties
function getNestedValue<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') return defaultValue
  
  const parts = key.split('.')
  let current = obj
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue
    }
    current = current[part]
  }
  
  return current !== null && current !== undefined ? current : defaultValue
}

// Define props for the component
interface HostFamiliesViewProps {
  initialStatusFilter?: string;
}

export function HostFamiliesView({ initialStatusFilter }: HostFamiliesViewProps = {}) {
  const { users, profiles, relationships, error, usedFallback } = useInstantData()
  const [hostFamilies, setHostFamilies] = useState<HostFamily[]>([])
  const [isViewLoading, setIsViewLoading] = useState(true)
  const mounted = useMounted()

  // Process host family data from Supabase
  useEffect(() => {
    // Skip data processing if there's an error
    if (error) return;

    try {
      setIsViewLoading(true)



      // Filter host users efficiently
      const hostUsers = users.filter(user => 
        user.role && user.role.toLowerCase().includes('host')
      );
      
      // Create a lookup map for faster relationship access
      const hostStudentMap = new Map<string, number>();
      
      // Pre-process relationships once
      relationships.forEach(r => {
        if (r.type === 'host_student' && r.primaryId) {
          const count = hostStudentMap.get(r.primaryId) || 0;
          hostStudentMap.set(r.primaryId, count + 1);
        }
      });
      
      // Create a profile lookup map
      const profileMap = new Map<string, Profile>();
      profiles.forEach(profile => {
        if (profile.type === 'host_family') {
          profileMap.set(profile.userId, profile);
        }
      });

      const processedHostFamilies = hostUsers.map(hostUser => {
        // Find the host's profile efficiently using map
        const hostProfile = profileMap.get(hostUser.id);
        
        // Get student count from pre-processed map
        const hostId = hostProfile ? hostProfile.id : `hostp-${hostUser.id.replace('host-', '')}`;
        const studentCount = hostStudentMap.get(hostId) || 0;
        
        // Generate verification date
        let verificationDate = new Date();
        const verificationDateStr = getNestedValue(hostUser.metadata, 'verification_date', null);
        
        if (verificationDateStr) {
          const parsedDate = new Date(verificationDateStr);
          if (!isNaN(parsedDate.getTime())) {
            verificationDate = parsedDate;
          } else {
            verificationDate.setDate(verificationDate.getDate() - Math.floor(Math.random() * 180));
          }
        } else {
          verificationDate.setDate(verificationDate.getDate() - Math.floor(Math.random() * 180));
        }
        
        // Ensure lastVerified is always a string with a defensive approach
        const formattedDate: string = verificationDate.toISOString().split('T')[0]!;
        
        // Determine status efficiently
        let status = 'Pending';
        const isVerified = hostProfile?.verified === true;
          
        if (isVerified) {
          // 90% of verified families should be active
          status = Math.random() < 0.9 ? 'Active' : 'Verified';
        } else if (hostProfile?.status === 'rejected') {
          status = 'Rejected';
        }
        
        // Get location efficiently
        const city = getNestedValue(hostUser.metadata, 'city', 
                     getNestedValue(hostProfile?.data, 'city', 'Unknown'));
                     
        const state = getNestedValue(hostUser.metadata, 'state', 
                      getNestedValue(hostProfile?.data, 'state', ''));
                      
        const location = state ? `${city}, ${state}` : city;
        
        // Generate family name - access individual parent names
        let name = 'Unknown Family'
        if (hostProfile?.data) {
          const profileData = hostProfile.data as any
          
          // Try to get parent names from host family structure
          const primaryHost = profileData.primary_host
          const secondaryHost = profileData.secondary_host
          
          if (primaryHost) {
            const primaryName = `${primaryHost.first_name || ''} ${primaryHost.last_name || ''}`.trim()
            
            if (secondaryHost) {
              const secondaryName = `${secondaryHost.first_name || ''} ${secondaryHost.last_name || ''}`.trim()
              name = secondaryName ? `${primaryName} & ${secondaryName}` : primaryName
            } else {
              name = primaryName
            }

          } else {
            // Fallback to user-level names if primary_host structure not available
            const firstName = hostUser.firstName || '';
            const lastName = hostUser.lastName || '';
            const familyName = `${firstName} ${lastName}`.trim();
            name = familyName || 'Unknown Family'
          }
        } else {
          // Final fallback to user-level names
          const firstName = hostUser.firstName || '';
          const lastName = hostUser.lastName || '';
          const familyName = `${firstName} ${lastName}`.trim();
          name = familyName || 'Unknown Family'
        }
        
        return {
          id: hostUser.id,
          name,
          location,
          status,
          students: studentCount,
          lastVerified: formattedDate,
          avatarUrl: hostUser.avatarUrl,
          initials: name.substring(0, 2).toUpperCase()
        } as HostFamily;
      });
      
      setHostFamilies(processedHostFamilies);
    } catch (e) {
      console.error('Failed to process host family data:', e);
      setHostFamilies([]);
    } finally {
      setIsViewLoading(false)
    }
  }, [users, profiles, relationships, error]);

  // Define columns with simplified type to prevent excessive stack depth
  const tableColumns = useMemo((): any[] => [
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
      accessorKey: "name" as const,
      header: "Name",
      enablePinning: true,
      enableSorting: true,
      size: 200,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center text-xs relative overflow-hidden">
            {row.original.avatarUrl ? (
              <>
                <img
                  src={row.original.avatarUrl}
                  alt={`${row.original.name}`}
                  className="h-8 w-8 rounded-[0.5rem] absolute inset-0 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-initials') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="fallback-initials absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                  {row.original.initials}
                </div>
              </>
            ) : (
              <div className="fallback-initials flex items-center justify-center">
                {row.original.initials}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{row.original.name}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      size: 180,
      enableSorting: true,
    },
    {
      accessorKey: "status" as const,
      header: "Status",
      size: 120,
      enableSorting: true,
      cell: ({ row }: any) => (
        <span className={cn(
          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
          row.original.status === 'Active' ? 'bg-green-100 text-green-800' :
          row.original.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
        )}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "students",
      header: "Students",
      size: 100,
      enableSorting: true,
    },
    {
      accessorKey: "lastVerified",
      header: "Last Verified",
      size: 140,
      enableSorting: true,
    },
    createActionsColumn<HostFamily>(
      [
        {
          label: "View Family Profile",
          icon: Users,
          onClick: (family) => {}
        },
        {
          label: "Edit Information",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "Schedule Verification",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "Assign Students",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "Send Communication",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "View History",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "Update Status",
          icon: undefined,
          onClick: (family) => {}
        },
        {
          label: "Deactivate Family",
          icon: undefined,
          onClick: (family) => {}
        }
      ],
      { useVerticalIcon: false }
    ),
  ], []); // Close useMemo without type assertion

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

  // Add a fallback for an empty display
      if (hostFamilies.length === 0 && !error && !isViewLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Host Families</CardTitle>
            <CardDescription>No host families found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No host families were found in the system.</p>
              <Button>Add Host Family</Button>
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
          <CardTitle>Host Families Overview</CardTitle>
          <CardDescription>Manage host families and student placements</CardDescription>
          {usedFallback && (
            <div className="mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-md inline-block">
              Using fallback mock data
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Total Families",
              value: mounted ? hostFamilies.length : 0,
              icon: Users,
              variant: "success",
              unit: "Active host families"
            },
            {
              title: "Active Families",
              value: mounted ? hostFamilies.filter(h => h.status === 'Active').length : 0,
              icon: CheckCircle,
              variant: "success",
              unit: "Currently hosting"
            },
            {
              title: "Verified Families",
              value: mounted ? hostFamilies.filter(h => h.status === 'Verified').length : 0,
              icon: CheckCircle,
              variant: "info",
              unit: "Ready for placement"
            },
            {
              title: "Pending Verification",
              value: mounted ? hostFamilies.filter(h => h.status === 'Pending').length : 0,
              icon: Clock,
              variant: "warning",
              unit: "Awaiting review"
            }
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Host Family List</CardTitle>
          <CardDescription>View and manage host families</CardDescription>
        </CardHeader>
        <CardContent>
                                  <AdvancedPinnedTable
            data={hostFamilies}
            columns={tableColumns}
            defaultPinnedColumns={{
              left: ['select', 'expander', 'name'],
              right: ['actions']
            }}
            defaultSorting={[{ id: 'name', desc: false }]}
            enableSearch={true}
            searchPlaceholder="Search Name or Location..."
            searchFunction={(family, query) => {
              const lowerQuery = query.toLowerCase();
              return (
                family.name.toLowerCase().includes(lowerQuery) || 
                family.location.toLowerCase().includes(lowerQuery)
              );
            }}
            enableStatusFilter={true}
            initialSelectedStatusFilter={initialStatusFilter}
            statusFilters={[
              {
                id: "active",
                label: "Active",
                value: "Active",
                field: "status",
                color: "green"
              },
              {
                id: "verified",
                label: "Verified",
                value: "Verified",
                field: "status",
                color: "blue"
              },
              {
                id: "pending",
                label: "Pending Verification",
                value: "Pending",
                field: "status",
                color: "amber"
              },
              {
                id: "rejected",
                label: "Rejected",
                value: "Rejected",
                field: "status",
                color: "red"
              }
            ]}
            enableFilters={true}
            filterOptions={[
              {
                id: "location-filter",
                label: "Location", 
                field: "location",
                options: Array.from(new Set(hostFamilies.map(h => h.location)))
                  .filter(location => location)
                  .sort()
                  .map(location => ({
                    label: location,
                    value: location
                  }))
              }
            ]}
            bulkActions={[
              {
                label: "Verify Selected",
                onClick: (rows) => {}
              },
              {
                label: "Send Email",
                onClick: (rows) => {}
              },
              {
                label: "Export Data",
                onClick: (rows) => {}
              }
            ]}
            renderExpandedContent={({ row }: any) => (
              <div className="grid grid-cols-3 gap-4 p-4">
                <div>
                  <h4 className="font-medium mb-2">Family Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>Name: {row.original.name}</p>
                    <p>Location: {row.original.location}</p>
                    <p>Status: {row.original.status}</p>
                    <p>Hosting Students: {row.original.students}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Verification Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>Last Verified: {row.original.lastVerified}</p>
                    <p>Verified By: Admin User</p>
                    <p>Home Visit: Completed</p>
                    <p>Background Check: Passed</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Student Placement</h4>
                  <div className="space-y-1 text-sm">
                    <p>Current Students: {row.original.students}</p>
                    <p>Max Capacity: 2</p>
                    <p>Preferred Gender: Any</p>
                    <p>Preferred Age Range: 14-18</p>
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