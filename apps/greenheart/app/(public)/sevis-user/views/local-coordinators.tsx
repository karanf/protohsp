'use client'

import { Button } from "@repo/ui/components/ui/button"
import { AdvancedPinnedTable } from "@repo/ui/components/ui/advanced-pinned-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { useState, useEffect } from "react"
import { useMounted } from "@/lib/useMounted"
import { 
  Users, 
  MapPin, 
  ActivitySquare, 
  MoreHorizontal, 
  ChevronDown, 
  UserCircle, 
  FileEdit, 
  UserPlus, 
  Home, 
  Send, 
  GraduationCap, 
  FileBarChart, 
  Tag, 
  AlertTriangle 
} from "lucide-react"
import { useInstantData } from "@/lib/useInstantData"
import type { User, Profile, Relationship } from "@/lib/useInstantData"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@repo/ui/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"
import { Metrics } from "@repo/ui/components/ui/metrics"

interface Coordinator {
  id: string
  name: string
  region: string
  status: string
  students: number
  hostFamilies: number
  lastActive: string
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
interface LocalCoordinatorsViewProps {
  initialStatusFilter?: string;
}

export function LocalCoordinatorsView({ initialStatusFilter }: LocalCoordinatorsViewProps = {}) {
  const { users, profiles, relationships, error } = useInstantData()
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isViewLoading, setIsViewLoading] = useState(true)
  const mounted = useMounted()

  // Process coordinator data from Supabase
  useEffect(() => {
    // Skip data processing if there's an error
    if (error) return

    try {
      setIsViewLoading(true) // Set loading to true at the start
      
      // Filter coordinator users
      const coordinatorUsers = users.filter(user => 
        user.role?.toLowerCase().includes('coordinator')
      )
      
      // Create profile and relationship lookup maps for better performance
      const profileByUserId = new Map();
      profiles.forEach(profile => {
        profileByUserId.set(profile.userId, profile);
      });
      
      // Pre-process relationships for each coordinator
      const studentRelationshipsByCoordId = new Map<string, number>();
      const hostRelationshipsByCoordId = new Map<string, number>();
      
      relationships.forEach(r => {
        if (!r.primaryId) return;
        
        if (r.type === 'coordinator_student') {
          const count = studentRelationshipsByCoordId.get(r.primaryId) || 0;
          studentRelationshipsByCoordId.set(r.primaryId, count + 1);
        } else if (r.type === 'coordinator_host') {
          const count = hostRelationshipsByCoordId.get(r.primaryId) || 0;
          hostRelationshipsByCoordId.set(r.primaryId, count + 1);
        } else if (r.data) {
          // Type cast to any to safely access possible coordinator_id
          const data = r.data as any;
          if (data.coordinator_id) {
            const coordId = data.coordinator_id as string;
            if (r.type.includes('student')) {
              const count = studentRelationshipsByCoordId.get(coordId) || 0;
              studentRelationshipsByCoordId.set(coordId, count + 1);
            } else if (r.type.includes('host')) {
              const count = hostRelationshipsByCoordId.get(coordId) || 0;
              hostRelationshipsByCoordId.set(coordId, count + 1);
            }
          }
        }
      });
      
      const processedCoordinators = coordinatorUsers.map(coordUser => {
        const coordProfile = profileByUserId.get(coordUser.id);
        const coordProfileId = coordProfile ? coordProfile.id : '';
        
        // Count managed students and host families efficiently using maps
        const managedStudents = studentRelationshipsByCoordId.get(coordProfileId) || 0;
        const managedHosts = hostRelationshipsByCoordId.get(coordProfileId) || 0;
        
        // Get last active date
        let lastActiveDate = new Date();
        const lastActiveDateStr = getNestedValue(coordUser.metadata, 'last_active', null);
        if (lastActiveDateStr) {
          const parsedDate = new Date(lastActiveDateStr);
          if (!isNaN(parsedDate.getTime())) {
            lastActiveDate = parsedDate;
          } else {
            lastActiveDate.setDate(lastActiveDate.getDate() - Math.floor(Math.random() * 30));
          }
        } else {
          lastActiveDate.setDate(lastActiveDate.getDate() - Math.floor(Math.random() * 30));
        }
        
        // Format the last active date (can never be undefined)
        const formattedDate: string = lastActiveDate.toISOString().split('T')[0]!;
        
        // Determine status
        let status = 'Active';
        const coordStatus = (getNestedValue(coordUser.metadata, 'status', '') || '') as string;
        if (coordStatus === 'inactive') {
          status = 'Inactive';
        } else if (coordStatus === 'training') {
          status = 'Training';
        }
        
        // Get region with better fallback logic
        let region = getNestedValue(coordUser.metadata, 'region', '') || 
                    getNestedValue(coordProfile?.data, 'region', '') ||
                    getNestedValue(coordProfile?.data, 'state', '') ||
                    getNestedValue(coordProfile?.data, 'city', '');
        
        // If still no region, try to infer from address or other data
        if (!region && coordProfile?.data) {
          const profileData = coordProfile.data as any;
          if (profileData.address) {
            // Try to extract state from address
            const addressParts = profileData.address.split(',');
            if (addressParts.length >= 2) {
              const lastPart = addressParts[addressParts.length - 1].trim();
              const statePart = lastPart.split(' ')[0];
              if (statePart.length === 2) {
                region = statePart;
              }
            }
          }
        }
        
        // Final fallback
        if (!region) {
          region = 'Unassigned - Needs Region Assignment';
        }
        
        // Generate name
        const firstName = coordUser.firstName || '';
        const lastName = coordUser.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unknown Coordinator';
        
        // Create the coordinator object with proper types
        return {
          id: coordUser.id,
          name,
          region,
          status,
          students: managedStudents,
          hostFamilies: managedHosts,
          lastActive: formattedDate,
          avatarUrl: coordUser.avatarUrl,
          initials: name.substring(0, 2).toUpperCase()
        } as Coordinator;
      });
      
      setCoordinators(processedCoordinators);
    } catch (e) {
      console.error('Failed to process coordinator data:', e);
      setCoordinators([]);
    } finally {
      setIsViewLoading(false) // Set loading to false when done
    }
  }, [users, profiles, relationships, error]);

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
      accessorKey: "name",
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
      accessorKey: "region",
      header: "Region",
      size: 180,
      enableSorting: true,
      cell: ({ row }: any) => {
        const isUnassigned = row.original.region.includes('Unassigned') || !row.original.region;
        return (
          <div className="flex items-center gap-2">
            {isUnassigned && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span className={cn(
              isUnassigned ? 'text-amber-700 font-medium' : 'text-gray-900'
            )}>
              {row.original.region}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      enableSorting: true,
      cell: ({ row }: any) => (
        <span className={cn(
          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
          row.original.status === 'Active' ? 'bg-green-100 text-green-800' :
          row.original.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
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
      accessorKey: "hostFamilies",
      header: "Host Families",
      size: 140,
      enableSorting: true,
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      size: 140,
      enableSorting: true,
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
                <UserCircle className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Information
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn(
                  row.original.region.includes('Unassigned') ? 'text-amber-700 font-medium' : ''
                )}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {row.original.region.includes('Unassigned') ? 'Assign Region (Required)' : 'Update Region'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Students
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                Assign Host Families
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GraduationCap className="mr-2 h-4 w-4" />
                Schedule Training
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileBarChart className="mr-2 h-4 w-4" />
                View Reports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
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

  // Add a fallback for an empty display - only after loading is complete
      if (coordinators.length === 0 && !error && !isViewLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Local Coordinators</CardTitle>
            <CardDescription>No coordinators found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No local coordinators were found in the system.</p>
              <Button>Add Coordinator</Button>
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
          <CardTitle>Local Coordinators Overview</CardTitle>
          <CardDescription>Manage regional coordinators and their responsibilities</CardDescription>
        </CardHeader>
        <CardContent>
          <Metrics metrics={[
            {
              title: "Total Coordinators",
              value: mounted ? coordinators.length : 0,
              icon: Users,
              variant: "info"
            },
            {
              title: "Active Coordinators",
              value: mounted ? coordinators.filter(c => c.status === 'Active').length : 0,
              icon: ActivitySquare,
              variant: "success",
              unit: "Currently working with students"
            },
            {
              title: "Need Region Assignment",
              value: mounted ? coordinators.filter(c => c.region.includes('Unassigned') || !c.region).length : 0,
              icon: AlertTriangle,
              variant: "warning",
              unit: "Coordinators missing regions"
            },
            {
              title: "Active Regions",
              value: mounted ? new Set(coordinators.map(c => c.region).filter(r => !r.includes('Unassigned'))).size : 0,
              icon: MapPin,
              variant: "info",
              unit: "Geographic coverage"
            }
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordinator List</CardTitle>
          <CardDescription>View and manage local coordinators</CardDescription>
        </CardHeader>
        <CardContent>
                                  <AdvancedPinnedTable
            data={coordinators}
            columns={columns}
            defaultPinnedColumns={{
              left: ['select', 'expander', 'name'],
              right: ['actions']
            }}
            defaultSorting={[{ id: 'name', desc: false }]}
            enableSearch={true}
            searchPlaceholder="Search Name or Region..."
            searchFunction={(coordinator, query) => {
              const lowerQuery = query.toLowerCase();
              return (
                coordinator.name.toLowerCase().includes(lowerQuery) || 
                coordinator.region.toLowerCase().includes(lowerQuery)
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
                id: "training",
                label: "In Training",
                value: "Training",
                field: "status",
                color: "amber"
              },
              {
                id: "inactive",
                label: "Inactive",
                value: "Inactive",
                field: "status",
                color: "red"
              }
            ]}
            enableFilters={true}
            filterOptions={[
              {
                id: "region-filter",
                label: "Region",
                field: "region",
                options: Array.from(new Set(coordinators.map(c => c.region)))
                  .filter(region => region)
                  .sort()
                  .map(region => ({
                    label: region,
                    value: region
                  }))
              }
            ]}
            bulkActions={[
              {
                label: "Assign Regions",
                onClick: (rows) => {
                  const unassignedCoords = rows.filter(row => 
                    row.original.region.includes('Unassigned') || !row.original.region
                  );
                  // Assign regions to selected coordinators
                  // TODO: Open region assignment modal
                }
              },
              {
                label: "Send Email",
                onClick: (rows) => {}
              },
              {
                label: "Assign Students",
                onClick: (rows) => {}
              },
              {
                label: "Export Data",
                onClick: (rows) => {}
              }
            ]}
            renderExpandedContent={({ row }: any) => {
              const isUnassigned = row.original.region.includes('Unassigned') || !row.original.region;
              return (
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div>
                    <h4 className="font-medium mb-2">Coordinator Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>Name: {row.original.name}</p>
                      <div className="flex items-center gap-2">
                        <span>Region:</span>
                        {isUnassigned && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                        <span className={cn(
                          isUnassigned ? 'text-amber-700 font-medium' : 'text-gray-900'
                        )}>
                          {row.original.region}
                        </span>
                      </div>
                      {isUnassigned && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                          <p className="text-xs text-amber-800">
                            ⚠️ This coordinator needs a region assignment to manage host families effectively.
                          </p>
                        </div>
                      )}
                      <p>Status: {row.original.status}</p>
                      <p>Last Active: {row.original.lastActive}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Assigned Students</h4>
                    <div className="space-y-1 text-sm">
                      <p>Total Students: {row.original.students}</p>
                      <p>Students in Progress: {Math.round(row.original.students * 0.7)}</p>
                      <p>Students Completed: {Math.round(row.original.students * 0.3)}</p>
                      <p>Available Capacity: {10 - row.original.students > 0 ? 10 - row.original.students : 0}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Host Families</h4>
                    <div className="space-y-1 text-sm">
                      <p>Assigned Families: {row.original.hostFamilies}</p>
                      <p>Verified Families: {Math.round(row.original.hostFamilies * 0.8)}</p>
                      <p>Pending Verification: {Math.round(row.original.hostFamilies * 0.2)}</p>
                      <p>Placement Rate: {row.original.hostFamilies > 0 ? Math.round((row.original.students / row.original.hostFamilies) * 100) : 0}%</p>
                      {isUnassigned && row.original.hostFamilies === 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                          <p className="text-xs text-blue-800">
                            💡 Host families are assigned based on coordinator regions. Assign a region to connect host families.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 