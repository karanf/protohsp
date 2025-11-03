"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { SkeletonLoader } from "../../ui/skeleton-loader";
import { db } from "@repo/database";
import { 
  User, 
  FileText, 
  Calendar, 
  School, 
  MapPin, 
  UserCheck, 
  Globe,
  X,
  Home,
  Heart,
  Camera,
  Shield,
  Stethoscope
} from "lucide-react";

interface StudentApplicationDetailsViewProps {
  student: any;
  onClose?: () => void;
}

/**
 * StudentApplicationDetailsView - Detailed view of student application data
 * 
 * Contains all the comprehensive application information including:
 * - Partner Assessment
 * - Student Details
 * - Family Information
 * - Biography
 * - School & Languages
 * - Housing, Food, Allergies & Pets
 * - Dear Family Letter
 * - Photos
 * - Documents
 * - Agreements
 * - Vaccinations
 */
export function StudentApplicationDetailsView({ 
  student, 
  onClose 
}: StudentApplicationDetailsViewProps) {
  
  // Extract relevant data for display
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
    status = student.status || { text: "Unknown", color: "gray" }
  } = student;

  // Extract profile data if available
  const profileData = student.profile?.data || {};
  
  // Get student profile ID - try multiple possible locations
  const profileId = student.profileId || student.profile?.id || student.id;
  
  // Use InstantDB query - handle potential errors gracefully
  let applicationResult: any = null;
  let isLoading = false;
  let error = null;
  let applications: any[] = [];
  let comprehensiveData = null;
  
  // Only call the hook if db is available
  if (db && profileId) {
    try {
      applicationResult = db.useQuery({
        studentApplications: {
          $: {
            where: {
              profileId: profileId
            }
          }
        }
      });
      
      isLoading = applicationResult?.isLoading || false;
      error = applicationResult?.error || null;
      applications = applicationResult?.data?.studentApplications || [];
      comprehensiveData = applications.length > 0 ? applications[0]?.comprehensiveData : null;
    } catch (err) {
      console.error('Error querying student applications:', err);
      error = err;
    }
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header skeleton */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <SkeletonLoader viewType="details" />
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error loading application details</div>
          <div className="text-sm text-muted-foreground mt-2">{error.message}</div>
          {onClose && (
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Use comprehensive data from the hook or fall back to profile data for backward compatibility
  const applicationData = comprehensiveData || profileData.comprehensive_application_data || {};
  
  // Extract partner assessment data from the new nested structure
  const partnerAssessment = profileData.partnerAssessment || {};
  
  // Helper function to safely get nested data - Updated to use new structure
  const getData = (path: string, fallback: string = "Not specified") => {
    // First try the new partner assessment structure
    const partnerData = path.split('.').reduce((obj, key) => obj?.[key], partnerAssessment);
    if (partnerData) return partnerData;
    
    // Fall back to legacy structure
    return path.split('.').reduce((obj, key) => obj?.[key], applicationData) || fallback;
  };
  
  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Unknown") return "Not specified";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">Student Application Details</h1>
                <p className="text-sm text-muted-foreground">{name} • {country} • {program}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (window.opener) {
                    // Try to find the correct user ID from the student data
                    const possibleUserId = student.userId || student.user_id || student.id;
                    
                    // If we have the user ID, navigate directly
                    if (possibleUserId) {
                      if (typeof window !== 'undefined' && window.opener) {
                        window.opener.location.href = `/sevis-user/student-application/${possibleUserId}`;
                        window.close();
                      }
                      return;
                    }
                    
                    // If we can't find the user ID, store the student data for the edit application
                    // similar to how the view application receives it
                    const studentData = JSON.stringify(student);
                    if (typeof window !== 'undefined' && window.opener) {
                      window.opener.localStorage.setItem('studentApplicationData', studentData);
                      
                      // Use a fallback ID and let the edit application handle the data from localStorage
                      const fallbackId = student.id || profileId || 'unknown';
                      const url = `/sevis-user/student-application/${fallbackId}?fromView=true`;
                      window.opener.location.href = url;
                      window.close();
                    }
                  }
                }}
              >
                Edit Application
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Accordion type="multiple" className="w-full space-y-4">
          
          {/* Partner Assessment */}
          <AccordionItem value="partner-assessment" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Partner Assessment
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* Interview */}
                <div>
                  <h4 className="font-semibold mb-4">Interview</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Interview Length:</span>
                          <div className="mt-1 text-base">{getData('interview.length')}</div>
                          <div className="text-xs text-muted-foreground mt-1">Interview must be at least 45 minutes long</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Date of Interview:</span>
                          <div className="mt-1 text-base">{getData('interview.date')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Name of Interviewer:</span>
                          <div className="mt-1 text-base">{getData('interview.interviewer')}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Student grade level at time of interview:</span>
                          <div className="mt-1 text-base">{getData('interview.studentGradeLevel', student.grade)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Recommended Grade for Enrollment in the U.S.:</span>
                          <div className="mt-1 text-base">{getData('interview.recommendedGrade', student.grade)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">GPA:</span>
                          <div className="mt-1 text-base">{getData('interview.gpa')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <h4 className="font-semibold mb-4">Special Requests</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      {/* Row 1: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">State Choice 1:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.stateChoice1', 'No preference')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">State Choice 2:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.stateChoice2', 'No preference')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">State Choice 3:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.stateChoice3', 'No preference')}</div>
                        </div>
                      </div>
                      
                      {/* Row 2: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Warm state request:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.warmStateRequest') === 'true' || getData('specialRequests.warmStateRequest') === true ? 'Yes' : 'No'} (CA, AZ, NM, TX, FL, GA, SC)</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Urban/suburban:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.urbanSuburban') === 'true' || getData('specialRequests.urbanSuburban') === true ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Mountain state request:</span>
                          <div className="mt-1 text-base">{getData('specialRequests.mountainStateRequest') === 'true' || getData('specialRequests.mountainStateRequest') === true ? 'Yes' : 'No'} (CO, MT, ID, WY, UT, WA, OR)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Placement */}
                <div>
                  <h4 className="font-semibold mb-4">Direct Placement</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">Direct Placement Requested:</span>
                        <div className="mt-1 text-base">{getData('directPlacement.isDirectPlacement') === 'true' || getData('directPlacement.isDirectPlacement') === true ? 'Yes' : 'No'}</div>
                      </div>
                      {(getData('directPlacement.isDirectPlacement') === 'true' || getData('directPlacement.isDirectPlacement') === true) && (
                        <div className="space-y-4">
                          <div>
                            <span className="font-semibold text-muted-foreground">Requested Host Family:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.hostFamily.name', 'Not specified')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Host Family Phone:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.hostFamily.phone', 'Not specified')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Host Family Address:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.hostFamily.address', 'Not specified')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Requested School:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.school.name', 'Not specified')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">School Phone:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.school.phone', 'Not specified')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">School Address:</span>
                            <div className="mt-1 text-base">{getData('directPlacement.school.address', 'Not specified')}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Evaluation */}
                <div>
                  <h4 className="font-semibold mb-4">Student Evaluation</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">Student's Character:</span>
                        <div className="mt-2 text-base leading-relaxed min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal'}}>{getData('studentEvaluation.studentCharacter', 'No character assessment available')}</div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Interviewer's Comments:</span>
                        <div className="mt-2 text-base leading-relaxed min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal'}}>{getData('studentEvaluation.interviewerComments', 'No comments available')}</div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Degree of Academic Interest:</span>
                        <div className="mt-1 text-base">{getData('studentEvaluation.academicInterest', 'Not specified')}</div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Personality Assessment (1-10 scale):</span>
                        <div className="mt-3">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base">
                            <div className="flex justify-between">
                              <span>Opinionated to Open-minded:</span>
                              <span>{getData('studentEvaluation.personalityTraits.opinionated', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Nervous to Calm:</span>
                              <span>{getData('studentEvaluation.personalityTraits.nervous', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shy to Assertive:</span>
                              <span>{getData('studentEvaluation.personalityTraits.shy', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Introspective to Outgoing:</span>
                              <span>{getData('studentEvaluation.personalityTraits.introspective', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rigid to Flexible:</span>
                              <span>{getData('studentEvaluation.personalityTraits.rigid', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protected to Independent:</span>
                              <span>{getData('studentEvaluation.personalityTraits.protected', '-')}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passive to Talkative:</span>
                              <span>{getData('studentEvaluation.personalityTraits.passive', '-')}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* English Comprehension */}
                <div>
                  <h4 className="font-semibold mb-4">English Comprehension Score</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">English Comprehension Score:</span>
                        <div className="mt-1 text-base">{getData('englishComprehension.score', 'Not specified')}</div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Potential Success Prediction:</span>
                        <div className="mt-1 text-base">{getData('englishComprehension.potentialSuccess', 'Not specified')}</div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Interview Report:</span>
                        <div className="mt-1 text-base">{getData('englishComprehension.interviewReport') ? 'Report uploaded' : 'No report uploaded'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Student Details */}
          <AccordionItem value="student-details" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Student Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold mb-4">Personal Information</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      {/* Row 1: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">First/Middle Names (as printed on passport):</span>
                          <div className="mt-1 text-base break-words">{getData('firstName', firstName)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Last Name (as printed on passport):</span>
                          <div className="mt-1 text-base break-words">{getData('lastName', lastName)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Preferred Name:</span>
                          <div className="mt-1 text-base">{getData('preferredName', firstName)}</div>
                        </div>
                      </div>
                      
                      {/* Row 2: 1 column */}
                      <div>
                        <span className="font-semibold text-muted-foreground">Program Option:</span>
                        <div className="mt-1 text-base">{getData('programType', program)}</div>
                      </div>
                      
                      {/* Row 3: 2 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Gender:</span>
                          <div className="mt-1 text-base">{getData('gender', gender)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                          <div className="mt-1 text-base">{getData('dateOfBirth', formatDate(dob))}</div>
                        </div>
                      </div>
                      
                      {/* Row 4: 2 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">City of Birth:</span>
                          <div className="mt-1 text-base">{getData('cityOfBirth')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Country of Birth:</span>
                          <div className="mt-1 text-base">{getData('countryOfBirth', country)}</div>
                        </div>
                      </div>
                      
                      {/* Row 5: 2 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Country of Legal Permanent Residence:</span>
                          <div className="mt-1 text-base break-words">{getData('countryOfCitizenship', country)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Country of Citizenship (Passport Country):</span>
                          <div className="mt-1 text-base break-words">{getData('countryOfCitizenship', country)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-4">Contact Information</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      {/* Row 1: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Email Address</span>
                          <div className="mt-1 text-base break-words">{getData('email')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Cell Phone Number</span>
                          <div className="mt-1 text-base">{getData('cellPhone')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Home Phone Number</span>
                          <div className="mt-1 text-base">{getData('homePhone')}</div>
                        </div>
                      </div>
                      
                      {/* Row 2: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Current Address Line 1</span>
                          <div className="mt-1 text-base break-words">{getData('address.line1')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">City</span>
                          <div className="mt-1 text-base">{getData('address.city')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Postal Code</span>
                          <div className="mt-1 text-base">{getData('address.postalCode')}</div>
                        </div>
                      </div>
                      
                      {/* Row 3: 2 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Current Address Line 2</span>
                          <div className="mt-1 text-base">{getData('address.line2', 'N/A')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Country</span>
                          <div className="mt-1 text-base">{getData('address.country', country)}</div>
                        </div>
                      </div>
                      
                      {/* Row 4: 3 columns */}
                      <div className="grid grid-cols-3 gap-x-8">
                        <div>
                          <span className="font-semibold text-muted-foreground">Emergency Contact Name</span>
                          <div className="mt-1 text-base">{getData('parents.mother.firstName', 'Not specified')}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Relation to Applicant (e.g. Father / Mother)</span>
                          <div className="mt-1 text-base break-words">Mother</div>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground">Emergency Contact Phone Number</span>
                          <div className="mt-1 text-base">{getData('parents.mother.phone')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div>
                  <h4 className="font-semibold mb-4">Profile Photo</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="w-64 h-80 bg-gray-100 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] flex items-center justify-center overflow-hidden mx-auto relative">
                      {avatarUrl ? (
                        <>
                          <img
                            src={avatarUrl}
                            alt={`${name}`}
                            className="w-full h-full rounded-[0.5rem] absolute inset-0 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-lg font-medium text-gray-500" style={{ display: 'none' }}>
                            {initials}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-gray-500">{initials}</span>
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Family */}
          <AccordionItem value="family" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Family
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* Parents/Guardians */}
                <div>
                  <h4 className="font-semibold mb-4">Parents / Guardians</h4>
                  
                  {/* Parent/Guardian 1 */}
                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Parent / Guardian 1</h5>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="space-y-4">
                        {/* Row 1: 3 columns */}
                        <div className="grid grid-cols-3 gap-x-8">
                          <div>
                            <span className="font-semibold text-muted-foreground">Family Name:</span>
                            <div className="mt-1 text-base">{getData('parents.father.lastName', lastName)}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">First Name(s):</span>
                            <div className="mt-1 text-base">{getData('parents.father.firstName')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Gender:</span>
                            <div className="mt-1 text-base">Male</div>
                          </div>
                        </div>
                        
                        {/* Row 2: 1 column */}
                        <div>
                          <span className="font-semibold text-muted-foreground">Is a legal guardian:</span>
                          <div className="mt-1 text-base">{getData('parents.father.isLegalGuardian') ? 'Yes' : 'No'}</div>
                        </div>
                        
                        {/* Row 3: 3 columns */}
                        <div className="grid grid-cols-3 gap-x-8">
                          <div>
                            <span className="font-semibold text-muted-foreground">Address:</span>
                            <div className="mt-1 text-base break-words">{getData('address.line1')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">City:</span>
                            <div className="mt-1 text-base">{getData('address.city')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Postal Code:</span>
                            <div className="mt-1 text-base">{getData('address.postalCode')}</div>
                          </div>
                        </div>
                        
                        {/* Row 4: 3 columns */}
                        <div className="grid grid-cols-3 gap-x-8">
                          <div>
                            <span className="font-semibold text-muted-foreground">Country:</span>
                            <div className="mt-1 text-base">{getData('address.country', country)}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Occupation:</span>
                            <div className="mt-1 text-base break-words">{getData('parents.father.occupation')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Cell Phone:</span>
                            <div className="mt-1 text-base">{getData('parents.father.phone')}</div>
                          </div>
                        </div>
                        
                        {/* Row 5: 3 columns */}
                        <div className="grid grid-cols-3 gap-x-8">
                          <div>
                            <span className="font-semibold text-muted-foreground">Work Phone:</span>
                            <div className="mt-1 text-base">{getData('parents.father.phone')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Email Address:</span>
                            <div className="mt-1 text-base break-words">{getData('parents.father.email')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Status:</span>
                            <div className="mt-1 text-base">{getData('parents.father.status', 'Living')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian 2 */}
                  <div className="mb-6">
                    <h5 className="font-medium mb-3">Parent / Guardian 2</h5>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="space-y-4">
                        {/* Similar structure as Parent 1 */}
                        <div className="grid grid-cols-3 gap-x-8">
                          <div>
                            <span className="font-semibold text-muted-foreground">Family Name:</span>
                            <div className="mt-1 text-base">{getData('parents.mother.lastName', lastName)}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">First Name(s):</span>
                            <div className="mt-1 text-base">{getData('parents.mother.firstName')}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">Gender:</span>
                            <div className="mt-1 text-base">Female</div>
                          </div>
                        </div>
                        {/* Continue with similar structure... */}
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Biography */}
          <AccordionItem value="biography" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Biography
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* Student Bio */}
                <div>
                  <h4 className="font-semibold mb-4">Student Bio</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">Bio:</span>
                        <div className="mt-2 text-base leading-relaxed min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal'}}>
                          {getData('studentBio')}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-muted-foreground">Video Introduction:</span>
                        <div className="mt-1 text-base break-words">{profileData.videoIntroLink || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favorite Activities */}
                <div>
                  <h4 className="font-semibold mb-4">Favorite Activities</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div>
                        <span className="font-semibold text-muted-foreground">Most Favorite Activity:</span>
                        <div className="mt-1 text-base">{getData('favoriteActivity1.name')}</div>
                        <div className="mt-2 text-sm text-muted-foreground">{getData('favoriteActivity1.description')}</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div>
                        <span className="font-semibold text-muted-foreground">Second Favorite Activity:</span>
                        <div className="mt-1 text-base">{getData('favoriteActivity2.name')}</div>
                        <div className="mt-2 text-sm text-muted-foreground">{getData('favoriteActivity2.description')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* School & Languages */}
          <AccordionItem value="school-languages" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <School className="h-4 w-4 mr-2" />
                School & Languages
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* School Information */}
                <div>
                  <h4 className="font-semibold mb-4">School Information</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">School Name:</span>
                        <div className="mt-1 text-base">{profileData.schoolName || "Not specified"}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Current Grade:</span>
                        <div className="mt-1 text-base">{profileData.currentGrade || student.grade}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">GPA:</span>
                        <div className="mt-1 text-base">{profileData.gpa || "Not specified"}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Favorite Subjects:</span>
                        <div className="mt-1 text-base">{profileData.favoriteSubjects || "Not specified"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold mb-4">Languages</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-muted-foreground">Native Language:</span>
                        <div className="mt-1 text-base">{getData('nativeLanguage')}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Years of English:</span>
                        <div className="mt-1 text-base">{getData('yearsOfEnglish', '6 years')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Housing, Food, Allergies & Pets */}
          <AccordionItem value="housing-food-allergies" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Housing, Food, Allergies & Pets
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-6">
                
                {/* Housing Preferences */}
                <div>
                  <h4 className="font-semibold mb-4">Housing Preferences</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-muted-foreground">Accommodation Type:</span>
                        <div className="mt-1 text-base">{profileData.accommodationType || "House"}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Comfortable with Pets:</span>
                        <div className="mt-1 text-base">{profileData.petComfort || "Yes"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Food & Allergies */}
                <div>
                  <h4 className="font-semibold mb-4">Food & Allergies</h4>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-muted-foreground">Dietary Restrictions:</span>
                        <div className="mt-1 text-base">{profileData.dietaryRestrictions || "None"}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Allergies:</span>
                        <div className="mt-1 text-base">{profileData.allergies || "None reported"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dear Family Letter */}
          <AccordionItem value="dear-family-letter" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Dear Family Letter
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="bg-gray-50 p-4 rounded text-base leading-relaxed min-w-0" style={{wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal'}}>
                {getData('dearFamilyLetter', 'Dear Host Family, I am excited to be part of your family and look forward to sharing my culture with you!')}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Photos */}
          <AccordionItem value="photos" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Photos
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-gray-50 p-4 rounded">
                    <div className="aspect-square bg-gray-200 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] mb-3 flex items-center justify-center overflow-hidden relative">
                      {avatarUrl ? (
                        <>
                          <img
                            src={avatarUrl}
                            alt={`${name}`}
                            className="w-full h-full rounded-[0.5rem] absolute inset-0 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="text-lg font-medium text-gray-500" style={{ display: 'none' }}>
                            IMG
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-gray-500">IMG</span>
                      )}
                    </div>
                    <div className="text-sm font-medium">Profile Photo</div>
                  </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="aspect-square bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Family Photo</div>
                  </div>
                  <div className="text-sm font-medium">Family Photo</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="aspect-square bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Activities</div>
                  </div>
                  <div className="text-sm font-medium">School Activities</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Documents */}
          <AccordionItem value="documents" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {['Passport', 'Birth Certificate', 'Transcript', 'Medical Records', 'English Teacher Recommendation'].map((doc, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // TODO: Open document when available
                    }}
                    className="w-full bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{doc}</div>
                        <div className="text-xs text-muted-foreground">Click to view document</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Agreements */}
          <AccordionItem value="agreements" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Agreements
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {['Conditions of Participation', 'Fee Transparency Acknowledgment', 'Medical Release', 'Permission For Travel'].map((agreement, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // TODO: Open agreement document when available
                    }}
                    className="w-full bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{agreement}</div>
                        <div className="text-xs text-muted-foreground">Click to view agreement</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Vaccinations */}
          <AccordionItem value="vaccinations" className="bg-white rounded-lg shadow-md border-0">
            <AccordionTrigger className="px-4 py-3">
              <div className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                Vaccinations
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {['MMR (Measles, Mumps, Rubella)', 'Tetanus/Diphtheria', 'Hepatitis B', 'Meningococcal', 'COVID-19', 'Varicella (Chickenpox)'].map((vaccine, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // TODO: Open vaccination record when available
                    }}
                    className="w-full bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{vaccine}</div>
                        <div className="text-xs text-muted-foreground">Click to view vaccination record</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </div>
    </div>
  );
} 