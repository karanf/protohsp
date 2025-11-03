import * as React from "react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { BaseExpandedViewProps } from "./expanded-views";
import { 
  User, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  History,
  Pencil,
  Home,
  UserCog,
  Globe,
  MapPin,
  School,
  Users
} from "lucide-react";

/**
 * ChangeQueueExpandedView - Expanded view for change queue records
 * 
 * Displays comprehensive information about change requests including:
 * - Entity information (student, host family, or coordinator)
 * - Current pending changes
 * - Previous change history
 * - Application details (placeholder)
 */
export function ChangeQueueExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  const [newComment, setNewComment] = React.useState<{[key: string]: string}>({});
  const [editedValues, setEditedValues] = React.useState<{[key: string]: string}>({});
  const [decisions, setDecisions] = React.useState<{[key: string]: string}>({});
  
  const changeRequest = row.original as any;
  
  const {
    id,
    recordType,
    recordId,
    recordName,
    requestedByName,
    requestDate,
    status,
    priority,
    description,
    changeItems,
    metadata
  } = changeRequest;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not specified";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getEntityInfo = () => {
    switch (recordType) {
      case 'student':
        return { icon: <User className="h-4 w-4" />, label: 'Student' };
      case 'host_family':
        return { icon: <Home className="h-4 w-4" />, label: 'Host Family' };
      case 'coordinator':
        return { icon: <UserCog className="h-4 w-4" />, label: 'Local Coordinator' };
      default:
        return { icon: <User className="h-4 w-4" />, label: 'Unknown' };
    }
  };

  const entityInfo = getEntityInfo();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'chip-amber';
      case 'partially_approved': return 'chip-blue';
      case 'fully_approved': return 'chip-green';
      case 'rejected': return 'chip-red';
      default: return 'chip-gray';
    }
  };

  const currentChanges = changeItems?.filter((item: any) => item.status === 'pending') || [];
  const previousChanges = changeItems?.filter((item: any) => item.status === 'approved' || item.status === 'rejected') || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Get entity-specific data from metadata
  const entityData = metadata || {};

  // Render entity-specific information sections
  const renderEntityInformation = () => {
    switch (recordType) {
      case 'student':
        return (
          <>
            {/* Personal Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Personal Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">First Name</div>
                  <div className="font-medium">{entityData.firstName || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Last Name</div>
                  <div className="font-medium">{entityData.lastName || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Date of Birth</div>
                  <div className="font-medium">{formatDate(entityData.dob)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Gender</div>
                  <div className="font-medium">{entityData.gender || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Country of Origin</div>
                  <div className="font-medium flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    {entityData.country || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Program Details */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <School className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Program Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Program Type</div>
                  <div className="font-medium">{entityData.program || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Partner Organization</div>
                  <div className="font-medium">{entityData.partner || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Grade Level</div>
                  <div className="font-medium">{entityData.grade || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Host School</div>
                  <div className="font-medium">{entityData.school || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Host Family</div>
                  <div className="font-medium">{entityData.hostFamilyName || "Not assigned"}</div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Application Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Status</div>
                  <div className="font-medium">{entityData.applicationStatus || "Under Review"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Approved On</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(entityData.approvedOn)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Last Action</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {entityData.lastAction || "No recent activity"}
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'host_family':
        return (
          <>
            {/* Family Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Family Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Family Name</div>
                  <div className="font-medium">{recordName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Primary Parent</div>
                  <div className="font-medium">{entityData.primaryParent || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Secondary Parent</div>
                  <div className="font-medium">{entityData.secondaryParent || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Family Status</div>
                  <div className="font-medium">{entityData.familyStatus || "Active"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Phone Number</div>
                  <div className="font-medium">{entityData.phone || "Not specified"}</div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Location Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Address</div>
                  <div className="font-medium">{entityData.address || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">City</div>
                  <div className="font-medium">{entityData.city || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">State</div>
                  <div className="font-medium">{entityData.state || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Region</div>
                  <div className="font-medium">{entityData.region || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Local Coordinator</div>
                  <div className="font-medium">{entityData.localCoordinator || "Not assigned"}</div>
                </div>
              </div>
            </div>

            {/* Student Placements */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Student Placements</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Students</div>
                  <div className="font-medium">{entityData.currentStudents || "None assigned"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Capacity</div>
                  <div className="font-medium">{entityData.capacity || "1 student"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Placement History</div>
                  <div className="font-medium">{entityData.placementHistory || "No previous placements"}</div>
                </div>
              </div>
            </div>
          </>
        );

      case 'coordinator':
        return (
          <>
            {/* Coordinator Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Coordinator Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Full Name</div>
                  <div className="font-medium">{recordName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Email Address</div>
                  <div className="font-medium">{entityData.email || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Phone Number</div>
                  <div className="font-medium">{entityData.phone || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="font-medium">{entityData.status || "Active"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Regional Director</div>
                  <div className="font-medium">{entityData.regionalDirector || "Not assigned"}</div>
                </div>
              </div>
            </div>

            {/* Service Region */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Service Region</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Primary Region</div>
                  <div className="font-medium">{entityData.region || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Service Area</div>
                  <div className="font-medium">{entityData.serviceArea || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Coverage States</div>
                  <div className="font-medium">{entityData.coverageStates || "Not specified"}</div>
                </div>
              </div>
            </div>

            {/* Assigned Host Families */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Assigned Host Families</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Active Host Families</div>
                  <div className="font-medium">{entityData.activeHostFamilies || "0"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Total Host Families</div>
                  <div className="font-medium">{entityData.totalHostFamilies || "0"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Active Students</div>
                  <div className="font-medium">{entityData.activeStudents || "0"}</div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div>
            <div className="flex items-center mb-3 pb-2 border-b">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="font-medium text-sm">Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="font-medium">{recordName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <div className="font-medium">{entityInfo.label}</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 w-full shadow-[inset_0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_0px_2px_0px_rgba(0,0,0,0.1)]">
      <div className="p-6 space-y-6">
        
        <div className="flex gap-8">
          <div className="flex flex-col items-center min-w-[200px]">
            <Avatar className="h-24 w-24 mb-3">
              <AvatarFallback className="text-2xl">{getInitials(recordName)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-center mb-2">{recordName}</h2>
            <Badge variant={getStatusVariant(status)}>
              {status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Badge>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-8">
            {renderEntityInformation()}
          </div>
        </div>

        <Separator />

        {/* Change Log Section */}
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <History className="h-4 w-4 mr-2" />
            Change Log
          </h3>

          <Accordion type="multiple" className="w-full space-y-2">
            
            <AccordionItem value="current-changes" className="bg-white rounded-lg shadow-md border-0">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Current Requested Changes ({currentChanges.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pt-2">
                  {currentChanges.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No pending changes - all changes have been processed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentChanges.map((item: any) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{item.fieldLabel}</span>
                            </div>
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <span className="text-gray-700 font-medium">
                                  {item.requestedBy || item.requesterName || "Unknown User"}
                                </span>
                                <Badge 
                                  variant={
                                    item.requesterRole === 'admin' ? 'chip-purple' :
                                    item.requesterRole === 'coordinator' || item.requesterRole === 'local_coordinator' ? 'chip-blue' :
                                    item.requesterRole === 'student' ? 'chip-green' :
                                    'chip-gray'
                                  }
                                  className="text-xs"
                                >
                                  {item.requesterRole === 'admin' ? 'Admin' :
                                   item.requesterRole === 'coordinator' || item.requesterRole === 'local_coordinator' ? 'Local Coordinator' :
                                   item.requesterRole === 'student' ? 'Student' :
                                   'User'}
                                </Badge>
                              </div>
                              <div className="text-gray-500 text-xs">
                                {formatDate(item.requestDate || requestDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-gray-600 text-sm">From:</span>
                              <div className="bg-white border rounded p-2 mt-1">
                                {item.previousValue || 'Empty'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 text-sm">To:</span>
                              <Input
                                type="text"
                                className="mt-1"
                                value={editedValues[item.id] !== undefined ? editedValues[item.id] : item.newValue}
                                onChange={(e) => setEditedValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Enter new value..."
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 min-w-0">
                              <Input
                                type="text"
                                placeholder="Optional comment..."
                                className="w-full"
                                value={newComment[item.id] || ''}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                              />
                            </div>
                            <Select 
                              value={decisions[item.id] || 'undecided'} 
                              onValueChange={(value) => setDecisions(prev => ({ ...prev, [item.id]: value }))}
                            >
                              <SelectTrigger className="w-[140px] shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approve">Approve</SelectItem>
                                <SelectItem value="reject">Reject</SelectItem>
                                <SelectItem value="undecided">Undecided</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" className="shrink-0">
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="previous-changes" className="bg-white rounded-lg shadow-md border-0">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Previous Changes ({previousChanges.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pt-2">
                  {previousChanges.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No previous changes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {previousChanges.map((item: any) => (
                        <div key={`history-${item.id}`} className="bg-gray-50 rounded border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.fieldLabel}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={item.status === 'approved' ? 'chip-green' : 'chip-red'} 
                                className="text-xs"
                              >
                                {item.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 font-medium text-sm">
                                {item.requestedBy || item.requesterName || "Unknown User"}
                              </span>
                              <Badge 
                                variant={
                                  item.requesterRole === 'admin' ? 'chip-purple' :
                                  item.requesterRole === 'coordinator' || item.requesterRole === 'local_coordinator' ? 'chip-blue' :
                                  item.requesterRole === 'student' ? 'chip-green' :
                                  'chip-gray'
                                }
                                className="text-xs"
                              >
                                {item.requesterRole === 'admin' ? 'Admin' :
                                 item.requesterRole === 'coordinator' || item.requesterRole === 'local_coordinator' ? 'Local Coordinator' :
                                 item.requesterRole === 'student' ? 'Student' :
                                 'User'}
                              </Badge>
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatDate(item.requestDate || requestDate)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500 text-xs">Previous:</span>
                              <div className="mt-1 bg-white border rounded p-2">
                                {item.previousValue || 'Empty'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Changed to:</span>
                              <div className="mt-1 bg-white border rounded p-2 font-medium">
                                {item.newValue}
                              </div>
                            </div>
                          </div>

                          {/* Decision Information */}
                          {(item.approvedBy || item.rejectionReason) && (
                            <div className="border-t pt-3 mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 text-xs">
                                    {item.status === 'approved' ? 'Approved by:' : 'Rejected by:'}
                                  </span>
                                  <span className="font-medium text-sm text-gray-800">
                                    {item.approvedBy || 'System'}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {formatDate(item.approvedAt || item.requestDate)}
                                </div>
                              </div>
                              
                              {/* Rejection Reason */}
                              {item.rejectionReason && (
                                <div className="mb-2">
                                  <span className="text-red-600 text-xs font-medium">Rejection Reason:</span>
                                  <div className="mt-1 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                                    {item.rejectionReason}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Comments Section */}
                          {item.comments && item.comments.length > 0 && (
                            <div className="border-t pt-3 mt-3">
                              <div className="text-gray-600 text-xs mb-2 font-medium">Comment:</div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-blue-900">
                                      {item.comments[0].authorName || 'Unknown'}
                                    </span>
                                    {item.comments[0].isInternal && (
                                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                        Internal
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-blue-600 text-xs">
                                    {formatDate(item.comments[0].createdAt)}
                                  </div>
                                </div>
                                <div className="text-sm text-blue-800">
                                  {item.comments[0].content}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        <Separator />

        {/* Application Section */}
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Application
          </h3>

          <Accordion type="multiple" className="w-full space-y-2">
            
            <AccordionItem value="application-details" className="bg-white rounded-lg shadow-md border-0">
              <AccordionTrigger className="px-4 py-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {recordType === 'student' ? 'Application Details' : 
                   recordType === 'host_family' ? 'Family Profile Details' : 
                   'Coordinator Profile Details'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="pt-2">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">
                      {recordType === 'student' ? 'Student application details will be available here' :
                       recordType === 'host_family' ? 'Host family profile details will be available here' :
                       'Coordinator profile details will be available here'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This section will show detailed information for the {entityInfo.label.toLowerCase()}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

      </div>
    </div>
  );
} 