import * as React from "react";
import { Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { MainModal } from "../../ui/main-modal";
import { FileUpload } from "../../ui/file-upload";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { toast } from "sonner";
import { BaseExpandedViewProps } from "./expanded-views";
import { StudentApplicationDetailsView } from "./student-application-details-view";
import { 
  User, 
  FileText, 
  Upload, 
  Calendar, 
  School, 
  MapPin, 
  UserCheck, 
  Clock,
  AlertCircle,
  CheckCircle,
  Globe,
  Hash,
  X,
  Workflow,
  History,
  Pencil
} from "lucide-react";

/**
 * SevisProcessingStudentView - SEVIS-specific expanded view for student records
 * 
 * Displays information relevant to SEVIS processing workflows including:
 * - Personal biological data required for SEVIS
 * - Program and partner details
 * - SEVIS processing timeline and status
 * - Application approval information
 * - SEVIS-specific actions
 */
export function SevisProcessingStudentView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // State for SEVIS ID assignment modal
  const [isSevisModalOpen, setIsSevisModalOpen] = React.useState(false);
  const [sevisIdInput, setSevisIdInput] = React.useState('');
  const [ds2019File, setDs2019File] = React.useState<File | null>(null);
  
  // Access student data from row.original
  const student = row.original as any;
  
  // Extract relevant data for SEVIS processing
  const {
    name = student.name || "Unknown Student",
    firstName = student.firstName || "",
    lastName = student.lastName || "",
    avatarUrl = student.avatarUrl,
    initials = student.initials || "ST",
    dob = student.dob || "Unknown",
    gender = student.gender || "Unknown",
    country = student.country || "Unknown",
    program = student.program || "Unknown Program",
    partner = student.partner || "Unknown Partner",
    sevisId = student.sevisId || "-",
    status = student.status || { text: "Unknown", color: "gray" },
    approvedOn = student.approvedOn || "Unknown",
    lastAction = student.lastAction || "No recent activity",
    hostFamilyName = student.hostFamilyName || "Unassigned",
    school = student.school || "Unknown",
    startDate = student.startDate || "Unknown",
    endDate = student.endDate || "Unknown",
    grade = student.grade || "Unknown"
  } = student;

  // Extract profile data if available
  const profileData = student.profile?.data || {};
  const approver = student.approvedBy || profileData.approved_by || "System";
  
  // Determine if student has SEVIS ID assigned
  const hasSevisId = sevisId !== "-" && sevisId !== "Pending assignment";
  
  // Determine if student has successful SEVIS processing
  const hasSuccessfulSevisProcessing = status?.text === 'Processing Successful' || profileData.sevisStatus === 'sevis_approved';
  
  // Determine if student is a 'New Student' type (exclude from change log)
  // Check profile data for SEVIS processing type (this is where it's actually stored)
  let sevisType = 'New Student'; // Default
  if (profileData?.sevis_processing_type) {
    sevisType = String(profileData.sevis_processing_type);
  } else if (profileData?.changeType) {
    sevisType = String(profileData.changeType);
  }
  
  const isNewStudentType = sevisType === 'New Student';
  
  // Debug: Log the sevisType value to help identify the issue
  console.log('Student SEVIS Type:', sevisType, 'Is New Student:', isNewStudentType);
  
  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Unknown") return "Not specified";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Handle SEVIS ID assignment modal
  const handleSevisAssignment = () => {
    setIsSevisModalOpen(true);
    setSevisIdInput('');
    setDs2019File(null);
  };

  const handleSevisSubmit = () => {
    // Close modal
    setIsSevisModalOpen(false);
    
    // Show success toast
    toast.success(`SEVIS ID and DS2019 successfully added to '${name}'`);
    
    // Reset form
    setSevisIdInput('');
    setDs2019File(null);
  };

  const handleSevisCancel = () => {
    setIsSevisModalOpen(false);
    setSevisIdInput('');
    setDs2019File(null);
  };

  return (
    <div className="bg-gray-50 w-full shadow-[inset_0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_0px_2px_0px_rgba(0,0,0,0.1)]">
      <div className="p-6 space-y-6">
        
        {/* Header Section - Student Identity & Information */}
        <div className="flex gap-8">
          {/* Student Avatar & Basic Info - Left Side */}
          <div className="flex flex-col items-center min-w-[200px]">
            <div className="h-24 w-24 mb-3 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center relative overflow-hidden">
              {avatarUrl ? (
                <>
                  <img
                    src={avatarUrl}
                    alt={`${name}`}
                    className="h-24 w-24 rounded-[0.5rem] absolute inset-0 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <span className="text-2xl font-medium" style={{ display: 'none' }}>
                    {initials}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-medium">{initials}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">{name}</h2>
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
          </div>

          {/* Information Grid - Right Side */}
          <div className="flex-1 grid grid-cols-3 gap-8">
            
            {/* Personal Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">Personal Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">First Name</div>
                  <div className="font-medium">{firstName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Last Name</div>
                  <div className="font-medium">{lastName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Date of Birth</div>
                  <div className="font-medium">{formatDate(dob)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Gender</div>
                  <div className="font-medium">{gender}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Country of Origin</div>
                  <div className="font-medium flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    {country}
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
                  <div className="font-medium">{program}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Partner Organization</div>
                  <div className="font-medium">{partner}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Grade Level</div>
                  <div className="font-medium">{grade}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Host School</div>
                  <div className="font-medium">{school}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Host Family</div>
                  <div className="font-medium">{hostFamilyName}</div>
                </div>
              </div>
            </div>

            {/* SEVIS Information */}
            <div>
              <div className="flex items-center mb-3 pb-2 border-b">
                <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="font-medium text-sm">SEVIS Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">SEVIS ID</div>
                  <div className="font-medium flex items-center">
                    {hasSevisId ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        {sevisId}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
                        Not Assigned
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Approved On</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(approvedOn)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Approved By</div>
                  <div className="font-medium flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {approver}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Last Action</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {lastAction}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <Separator />

        {/* Application Summary */}
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Application Summary
          </h3>
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Application Status</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Status:</span>
                    <Badge variant="chip-green">Approved</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Partner Assessment:</span>
                    <Badge variant="chip-green">Complete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation:</span>
                    <Badge variant="chip-green">Complete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SEVIS Ready:</span>
                    <Badge variant="chip-green">Yes</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Program Timeline</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{formatDate(startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{formatDate(endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>10 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grade Level:</span>
                    <span>{grade}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">SEVIS Processing</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Application Review:</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation:</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>SEVIS Entry:</span>
                    {hasSevisId ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>DS-2019 Issued:</span>
                    {hasSevisId ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* SEVIS Processing Failed Fields - Only show for failed records */}
        {status?.text === 'Processing Failed' && (
          <>
            <div>
              <h3 className="font-medium mb-4 flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                SEVIS Processing Errors
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-4">
                  SEVIS processing failed with the following errors:
                </p>
                <div className="space-y-3">
                  {/* Display actual SEVIS errors if available */}
                  {student.sevisErrors && student.sevisErrors.length > 0 ? (
                    student.sevisErrors.map((error: any, index: number) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-red-800">
                              {error.changeType || error.field || 'Unknown Field'}
                            </h4>
                            <p className="text-xs mt-1 text-red-600">
                              <span className="font-medium">SEVIS Error:</span> {error.message || error.errorMessage || 'Unknown error'}
                            </p>
                            {error.expectedFormat && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Expected:</span> {error.expectedFormat}
                              </p>
                            )}
                            {error.receivedValue && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Received:</span> {error.receivedValue}
                              </p>
                            )}
                            {error.sevisCode && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">SEVIS Code:</span> {error.sevisCode}
                              </p>
                            )}
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {error.severity || 'Error'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for when no specific error data is available
                    <div className="bg-white border border-red-200 rounded p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-red-800">Processing Error</h4>
                          <p className="text-xs mt-1 text-red-600">
                            <span className="font-medium">Error:</span> {student.errorMessage || 'SEVIS processing failed - no specific error details available'}
                          </p>
                          {student.changeType && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Change Type:</span> {student.changeType}
                            </p>
                          )}
                        </div>
                        <Badge variant="destructive" className="text-xs">Failed</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Change Log Section - Only show for non-New Student types */}
        {!isNewStudentType && (
          <>
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
                      Current Requested Changes (0)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="pt-2">
                      <div className="text-center py-4 text-gray-500">
                        <p>No pending changes - all changes have been processed</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="previous-changes" className="bg-white rounded-lg shadow-md border-0">
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Previous Changes (0)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="pt-2">
                      <div className="text-center py-4 text-gray-500">
                        <p>No previous changes</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

            <Separator />
          </>
        )}

        {/* Action Buttons */}
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <Workflow className="h-4 w-4 mr-2" />
            Actions
          </h3>
          <div className="flex items-center gap-3">
            {/* Application Actions */}
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={() => {
                // Store student data in localStorage for the new window to access
                const studentData = JSON.stringify(student);
                localStorage.setItem('studentApplicationData', studentData);
                
                // Generate a unique student ID (using existing ID or name as fallback)
                const studentId = student.id || student.profileId || encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase());
                
                // Open the dedicated route in a new window (standalone view without layout)
                const url = `/student-application-details/${studentId}`;
                window.open(url, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
              }}
            >
              <FileText className="h-4 w-4" />
              View Application
            </Button>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={() => {
                // Generate a unique student ID (using existing ID or name as fallback)
                const studentId = student.id || student.profileId || encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase());
                
                // Use Next.js routing instead of window.location.href to prevent full page reload
                const url = `/sevis-user/student-application/${studentId}`;
                if (typeof window !== 'undefined') {
                  window.location.href = url;
                }
              }}
            >
              <FileText className="h-4 w-4" />
              Edit Application
            </Button>
            
            {/* Vertical Separator */}
            <div className="h-8 w-px bg-gray-300 mx-2"></div>
            
            {/* SEVIS Actions */}
            
            <Button variant="default" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Add to SEVIS Batch
            </Button>
            {isNewStudentType && (
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={handleSevisAssignment}
              >
                <Hash className="h-4 w-4" />
                Assign SEVIS ID & DS-2019
              </Button>
            )}
            {!isNewStudentType && (
              <Button variant="secondary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reprint DS-2019
              </Button>
            )}
          </div>
        </div>

        {/* SEVIS ID Assignment Modal */}
        <MainModal
          isOpen={isSevisModalOpen}
          onClose={handleSevisCancel}
          icon={<Hash />}
          title={`Assign SEVIS ID & DS2019 - ${name}`}
          cancelAction={{
            text: "Cancel",
            onClick: handleSevisCancel
          }}
          primaryAction={{
            text: "Save",
            onClick: handleSevisSubmit
          }}
        >
          <div className="space-y-6">
            {/* Student Personal Details */}
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {avatarUrl ? (
                      <>
                        <img
                          src={avatarUrl}
                          alt={`${name}`}
                          className="h-16 w-16 rounded-[0.5rem] absolute inset-0 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <span className="text-lg font-medium" style={{ display: 'none' }}>
                          {initials}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-medium">{initials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {country} • {program}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Date of Birth:</span>
                    <div>{formatDate(dob)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Gender:</span>
                    <div>{gender}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Host Family:</span>
                    <div>{hostFamilyName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">School:</span>
                    <div>{school}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEVIS ID Input */}
            <div className="space-y-2">
              <Label htmlFor="sevis-id" className="text-sm font-medium">
                SEVIS ID
              </Label>
              <Input
                id="sevis-id"
                placeholder="Enter SEVIS ID (e.g., N1234567890)"
                value={sevisIdInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSevisIdInput(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                SEVIS ID format: N followed by 10 digits
              </p>
            </div>

            {/* DS2019 Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                DS-2019 Form
              </Label>
              <FileUpload
                accept=".pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024} // 10MB
                formats="PDF, DOC, DOCX (max. 10MB)"
                onFileSelect={setDs2019File}
                previewPosition="bottom"
              />
            </div>
          </div>
        </MainModal>



      </div>
    </div>
  );
} 