'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@repo/ui/components/ui/alert'
import { FileUpload } from '@repo/ui/components/ui/file-upload'
import { OriginDatePicker } from '@repo/ui/components/ui/origin-date-picker'

import { useInstantData } from '@/lib/useInstantData'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Edit,
  Eye,
  Download,
  Upload,
  Calendar,
  Save
} from 'lucide-react'
import { SkeletonLoader } from '@repo/ui/components/ui/skeleton-loader'

interface StudentApplicationViewProps {
  studentId: string;
}

// US States for the select dropdowns
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export function StudentApplicationView({ studentId }: StudentApplicationViewProps) {
  const { users, profiles, error, usedFallback } = useInstantData();
  const [studentFromView, setStudentFromView] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  

  
  // Form state for the application
  const [formData, setFormData] = useState({
    directPlacement: {
      isDirectPlacement: false,
      hostFamily: {
        name: '',
        phone: '',
        address: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        showManualEntry: false
      },
      school: {
        name: '',
        phone: '',
        address: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        showManualEntry: false
      }
    },
    interview: {
      length: '',
      date: '',
      interviewer: '',
      studentGradeLevel: '',
      recommendedGrade: '',
      gpa: ''
    },
    specialRequests: {
      stateChoice1: '',
      stateChoice2: '',
      stateChoice3: '',
      warmStateRequest: false,
      urbanSuburban: false,
      mountainStateRequest: false
    },
    studentEvaluation: {
      studentCharacter: '',
      interviewerComments: '',
      academicInterest: '',
      personalityTraits: {
        opinionated: '',
        nervous: '',
        shy: '',
        introspective: '',
        rigid: '',
        protected: '',
        passive: ''
      }
    },
    englishComprehension: {
      score: '',
      potentialSuccess: '',
      interviewReport: null as File | null
    }
  });
  
  // Check if this is coming from the view application with stored data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fromView') === 'true') {
      const storedData = localStorage.getItem('studentApplicationData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setStudentFromView(parsedData);
          setIsInitialLoading(false);
          // Clear the stored data
          localStorage.removeItem('studentApplicationData');
        } catch (err) {
          console.error('Error parsing stored student data:', err);
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    } else {
      // Normal loading - wait for data
      setIsInitialLoading(false);
    }
  }, []);
  
  // Process specific student application data
  const processedData = useMemo(() => {
    if (error) {
      console.error('Error loading data:', error);
      return null;
    }
    
    try {
      // If we have student data from the view, use it directly
      if (studentFromView) {
        return {
          student: {
            id: studentFromView.id,
            name: studentFromView.name,
            email: studentFromView.email || 'Unknown',
            status: studentFromView.status?.text || 'pending',
            submittedAt: studentFromView.submittedAt || null,
            reviewedAt: studentFromView.reviewedAt || null,
            program: studentFromView.program || 'Unknown',
            country: studentFromView.country || 'Unknown',
            profileData: studentFromView.profile?.data || {}
          },
          profile: studentFromView.profile
        };
      }
      
      // Otherwise, find the specific student user in the database
      const studentUser = users.find(user => user.id === studentId && user.role === 'student');
      
      if (!studentUser) {
        return null;
      }
      
      // Find the student's profile
      const studentProfile = profiles.find(p => p.userId === studentUser.id);
      
      // Combine user and profile data for the specific student
      const studentApplication = {
        id: studentUser.id,
        name: `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim() || studentUser.email || 'Unknown',
        email: studentUser.email,
        status: studentProfile?.data?.applicationStatus || 'pending',
        submittedAt: studentProfile?.data?.submittedAt || null,
        reviewedAt: studentProfile?.data?.reviewedAt || null,
        program: studentProfile?.data?.program || 'Unknown',
        country: studentProfile?.data?.country || 'Unknown',
        // Don't spread the entire data object to avoid rendering issues
        profileData: studentProfile?.data || {}
      };
      
      return {
        student: studentApplication,
        profile: studentProfile
      };
    } catch (err) {
      console.error('Error processing student application:', err);
      return null;
    }
  }, [users, profiles, error, studentId, studentFromView]);

  // Initialize form data from database
  useEffect(() => {
    if (processedData && processedData.student.profileData) {
      const profileData = processedData.student.profileData;
      
      // Try to get data from new nested structure first, then fall back to legacy structure
      const partnerAssessment = profileData.partnerAssessment || {};
      const comprehensiveData = profileData.comprehensive_application_data || {};
      
      const directPlacementData = partnerAssessment.directPlacement || profileData.directPlacement || comprehensiveData.directPlacement || {};
      const interviewData = partnerAssessment.interview || profileData.interview || comprehensiveData.interview || {};
      const specialRequestsData = partnerAssessment.specialRequests || profileData.specialRequests || comprehensiveData.specialRequests || {};
      const studentEvaluationData = partnerAssessment.studentEvaluation || profileData.studentEvaluation || comprehensiveData.studentEvaluation || {};
      const englishComprehensionData = partnerAssessment.englishComprehension || profileData.englishComprehension || comprehensiveData.englishComprehension || {};
      
      setFormData(prev => ({
        ...prev,
        directPlacement: {
          isDirectPlacement: directPlacementData.isDirectPlacement || false,
          hostFamily: {
            name: directPlacementData.hostFamily?.name || '',
            phone: directPlacementData.hostFamily?.phone || '',
            address: directPlacementData.hostFamily?.address || '',
            addressLine1: directPlacementData.hostFamily?.addressLine1 || '',
            addressLine2: directPlacementData.hostFamily?.addressLine2 || '',
            city: directPlacementData.hostFamily?.city || '',
            state: directPlacementData.hostFamily?.state || '',
            zip: directPlacementData.hostFamily?.zip || '',
            showManualEntry: directPlacementData.hostFamily?.showManualEntry || false
          },
          school: {
            name: directPlacementData.school?.name || '',
            phone: directPlacementData.school?.phone || '',
            address: directPlacementData.school?.address || '',
            addressLine1: directPlacementData.school?.addressLine1 || '',
            addressLine2: directPlacementData.school?.addressLine2 || '',
            city: directPlacementData.school?.city || '',
            state: directPlacementData.school?.state || '',
            zip: directPlacementData.school?.zip || '',
            showManualEntry: directPlacementData.school?.showManualEntry || false
          }
        },
        interview: {
          length: interviewData.length || '',
          date: interviewData.date || '',
          interviewer: interviewData.interviewer || '',
          studentGradeLevel: interviewData.studentGradeLevel || '',
          recommendedGrade: interviewData.recommendedGrade || '',
          gpa: interviewData.gpa || ''
        },
        specialRequests: {
          stateChoice1: specialRequestsData.stateChoice1 || '',
          stateChoice2: specialRequestsData.stateChoice2 || '',
          stateChoice3: specialRequestsData.stateChoice3 || '',
          warmStateRequest: specialRequestsData.warmStateRequest || false,
          urbanSuburban: specialRequestsData.urbanSuburban || false,
          mountainStateRequest: specialRequestsData.mountainStateRequest || false
        },
        studentEvaluation: {
          studentCharacter: studentEvaluationData.studentCharacter || '',
          interviewerComments: studentEvaluationData.interviewerComments || '',
          academicInterest: studentEvaluationData.academicInterest || '',
          personalityTraits: {
            opinionated: studentEvaluationData.personalityTraits?.opinionated || '',
            nervous: studentEvaluationData.personalityTraits?.nervous || '',
            shy: studentEvaluationData.personalityTraits?.shy || '',
            introspective: studentEvaluationData.personalityTraits?.introspective || '',
            rigid: studentEvaluationData.personalityTraits?.rigid || '',
            protected: studentEvaluationData.personalityTraits?.protected || '',
            passive: studentEvaluationData.personalityTraits?.passive || ''
          }
        },
        englishComprehension: {
          score: englishComprehensionData.score || '',
          potentialSuccess: englishComprehensionData.potentialSuccess || '',
          interviewReport: englishComprehensionData.interviewReport || null
        }
      }));
    }
  }, [processedData]);

  // Handle direct placement field changes
  const handleDirectPlacementChange = (section: 'hostFamily' | 'school', field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      directPlacement: {
        ...prev.directPlacement,
        [section]: {
          ...prev.directPlacement[section],
          [field]: value
        }
      }
    }));
  };

  // Handle manual entry toggle
  const handleManualEntryToggle = (section: 'hostFamily' | 'school') => {
    setFormData(prev => ({
      ...prev,
      directPlacement: {
        ...prev.directPlacement,
        [section]: {
          ...prev.directPlacement[section],
          showManualEntry: !prev.directPlacement[section].showManualEntry
        }
      }
    }));
  };

  // Handle form field changes
  const handleFieldChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (section: string, field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: checked
      }
    }));
  };

  // Handle student evaluation field changes
  const handleStudentEvaluationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      studentEvaluation: {
        ...prev.studentEvaluation,
        [field]: value
      }
    }));
  };

  // Handle personality trait changes
  const handlePersonalityTraitChange = (trait: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      studentEvaluation: {
        ...prev.studentEvaluation,
        personalityTraits: {
          ...prev.studentEvaluation.personalityTraits,
          [trait]: value
        }
      }
    }));
  };

  // Handle English comprehension field changes
  const handleEnglishComprehensionChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      englishComprehension: {
        ...prev.englishComprehension,
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving form data:', formData);
  };

  // Show skeleton loader while data is loading
  if (isInitialLoading || (!studentFromView && users.length === 0 && !error)) {
    return <SkeletonLoader viewType="form" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Loading Data
            </CardTitle>
            <CardDescription>
              Unable to load student application data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>
              Unable to find student application data for ID: {studentId}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { student, profile } = processedData;

  return (
    <div className="space-y-6">
      {usedFallback && (
        <div className="p-2 bg-amber-100 text-amber-800 rounded-md">
          Using fallback mock data for demonstration purposes
        </div>
      )}
      
      {/* SEVIS Processing Error Alert - Only show for failed SEVIS processing */}
      {processedData?.student.profileData?.sevisStatus === 'sevis_failed' && (
        <Alert variant="error" className="shadow-lg">
          <AlertTitle>SEVIS Processing Error</AlertTitle>
          <AlertDescription>
            <div>
              <p>SEVIS processing type: {processedData.student.profileData.sevis_processing_type || processedData.student.profileData.changeType || 'Unknown'}</p>
              <p>SEVIS Message: {processedData.student.profileData.sevisMessage || 'No error message available'}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Interview Section */}
      <Card id="interview-details">
        <CardHeader>
          <CardTitle className="text-lg">Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Interview Section */}
          <div className="space-y-6">
            {/* Interview Length, Date, and Interviewer */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <Label htmlFor="interview-length" className="font-medium text-gray-700">Interview length</Label>
                <div className="relative">
                  <Input
                    id="interview-length"
                    type="number"
                    value={formData.interview.length}
                    onChange={(e) => handleFieldChange('interview', 'length', e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    minutes
                  </span>
                </div>
                <p className="text-gray-500">
                  Interview must be at least 45 minutes long
                </p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="interview-date" className="font-medium text-gray-700">Date of Interview</Label>
                <OriginDatePicker
                  value={formData.interview.date || ''}
                  onChange={(date) => {
                    handleFieldChange('interview', 'date', date?.toISOString().split('T')[0] ?? '');
                  }}
                  placeholder="Select interview date"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="interviewer-name" className="font-medium text-gray-700">Name of Interviewer</Label>
                <Input
                  id="interviewer-name"
                  type="text"
                  value={formData.interview.interviewer}
                  onChange={(e) => handleFieldChange('interview', 'interviewer', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Student Grade Level */}
              <div className="space-y-3">
                <Label className="font-medium text-gray-700">Student grade level at time of interview</Label>
                <RadioGroup
                  value={formData.interview.studentGradeLevel}
                  onValueChange={(value) => handleFieldChange('interview', 'studentGradeLevel', value)}
                  className="flex items-center gap-8"
                >
                  {['8th', '9th', '10th', '11th', '12th'].map((grade) => (
                    <div key={grade} className="flex items-center space-x-2">
                      <RadioGroupItem value={grade} id={`student-grade-${grade}`} />
                      <Label htmlFor={`student-grade-${grade}`} className="font-normal">{grade}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Recommended Grade */}
              <div className="space-y-3">
                <Label className="font-medium text-gray-700">Recommended Grade for Enrollment in the U.S.</Label>
                <RadioGroup
                  value={formData.interview.recommendedGrade}
                  onValueChange={(value) => handleFieldChange('interview', 'recommendedGrade', value)}
                  className="flex items-center gap-8"
                >
                  {['9th', '10th', '11th', '12th'].map((grade) => (
                    <div key={grade} className="flex items-center space-x-2">
                      <RadioGroupItem value={grade} id={`recommended-grade-${grade}`} />
                      <Label htmlFor={`recommended-grade-${grade}`} className="font-normal">{grade}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* GPA */}
            <div className="space-y-3">
              <Label className="font-medium text-gray-700">GPA</Label>
              <RadioGroup
                value={formData.interview.gpa}
                onValueChange={(value) => handleFieldChange('interview', 'gpa', value)}
                className="flex items-center gap-6"
              >
                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'].map((gpa) => (
                  <div key={gpa} className="flex items-center space-x-2">
                    <RadioGroupItem value={gpa} id={`gpa-${gpa}`} />
                    <Label htmlFor={`gpa-${gpa}`} className="font-normal">{gpa}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Special Requests Section */}
      <Card id="special-requests">
        <CardHeader>
          <CardTitle className="text-lg">Special Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            
            {/* State Choices */}
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <Label htmlFor="state-choice-1" className="font-medium text-gray-700">State Choice 1</Label>
                <Select 
                  value={formData.specialRequests.stateChoice1} 
                  onValueChange={(value) => handleFieldChange('specialRequests', 'stateChoice1', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="state-choice-2" className="font-medium text-gray-700">State Choice 2</Label>
                <Select 
                  value={formData.specialRequests.stateChoice2} 
                  onValueChange={(value) => handleFieldChange('specialRequests', 'stateChoice2', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="state-choice-3" className="font-medium text-gray-700">State Choice 3</Label>
                <Select 
                  value={formData.specialRequests.stateChoice3} 
                  onValueChange={(value) => handleFieldChange('specialRequests', 'stateChoice3', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Divider */}
            <hr className="border-gray-200" />
            
            {/* Checkbox Options */}
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="warm-state-request"
                  checked={formData.specialRequests.warmStateRequest}
                  onCheckedChange={(checked) => handleCheckboxChange('specialRequests', 'warmStateRequest', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="warm-state-request" className="font-normal">
                    Warm state request
                  </Label>
                  <p className="text-gray-500">
                    (CA, AZ, NM, TX, FL, GA, SC)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="urban-suburban"
                  checked={formData.specialRequests.urbanSuburban}
                  onCheckedChange={(checked) => handleCheckboxChange('specialRequests', 'urbanSuburban', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="urban-suburban" className="font-normal">
                  Urban/suburban
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="mountain-state-request"
                  checked={formData.specialRequests.mountainStateRequest}
                  onCheckedChange={(checked) => handleCheckboxChange('specialRequests', 'mountainStateRequest', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="mountain-state-request" className="font-normal">
                    Mountain state request
                  </Label>
                  <p className="text-gray-500">
                    (CO, MT, ID, WY, UT, WA, OR)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
       
        {/* Direct Placement Section */}
        <Card id="direct-placement">
          <CardHeader>
            <CardTitle className="text-lg">Direct Placement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="direct-placement"
                checked={formData.directPlacement.isDirectPlacement}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  directPlacement: {
                    ...prev.directPlacement,
                    isDirectPlacement: checked as boolean
                  }
                }))}
              />
              <Label htmlFor="direct-placement" className="font-medium">
                Is this student requesting a Direct Placement?
              </Label>
            </div>
            
            {formData.directPlacement.isDirectPlacement && (
              <div className="space-y-8">
                {/* Host Family Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <Label htmlFor="host-family-name" className="font-medium text-gray-700">
                        Requested Host Family Name
                      </Label>
                      <Input
                        id="host-family-name"
                        value={formData.directPlacement.hostFamily.name}
                        onChange={(e) => handleDirectPlacementChange('hostFamily', 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="host-family-phone" className="font-medium text-gray-700">
                        Requested Host Family Phone
                      </Label>
                      <Input
                        id="host-family-phone"
                        value={formData.directPlacement.hostFamily.phone}
                        onChange={(e) => handleDirectPlacementChange('hostFamily', 'phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <Label htmlFor="host-family-address" className="font-medium text-gray-700">
                        Requested Host Family Address
                      </Label>
                      <Input
                        id="host-family-address"
                        value={formData.directPlacement.hostFamily.address}
                        onChange={(e) => handleDirectPlacementChange('hostFamily', 'address', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 self-end h-8">
                      <button
                        type="button"
                        onClick={() => handleManualEntryToggle('hostFamily')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Can't find the address? Enter it manually
                      </button>
                    </div>
                  </div>
                  
                  {formData.directPlacement.hostFamily.showManualEntry && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <Label htmlFor="host-family-address-line1" className="font-medium text-gray-700">
                            Requested Host Family Address Line 1
                          </Label>
                          <Input
                            id="host-family-address-line1"
                            value={formData.directPlacement.hostFamily.addressLine1}
                            onChange={(e) => handleDirectPlacementChange('hostFamily', 'addressLine1', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="host-family-city" className="font-medium text-gray-700">
                            Requested Host Family City
                          </Label>
                          <Input
                            id="host-family-city"
                            value={formData.directPlacement.hostFamily.city}
                            onChange={(e) => handleDirectPlacementChange('hostFamily', 'city', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="host-family-zip" className="font-medium text-gray-700">
                            Requested Host Family Zip
                          </Label>
                          <Input
                            id="host-family-zip"
                            value={formData.directPlacement.hostFamily.zip}
                            onChange={(e) => handleDirectPlacementChange('hostFamily', 'zip', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <Label htmlFor="host-family-address-line2" className="font-medium text-gray-700">
                            Requested Host Family Address Line 2
                          </Label>
                          <Input
                            id="host-family-address-line2"
                            value={formData.directPlacement.hostFamily.addressLine2}
                            onChange={(e) => handleDirectPlacementChange('hostFamily', 'addressLine2', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="host-family-state" className="font-medium text-gray-700 w-full">
                            Requested Host Family State
                          </Label>
                          <Select
                            value={formData.directPlacement.hostFamily.state}
                            onValueChange={(value) => handleDirectPlacementChange('hostFamily', 'state', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* School Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <Label htmlFor="school-name" className="font-medium text-gray-700">
                        Requested School Name
                      </Label>
                      <Input
                        id="school-name"
                        value={formData.directPlacement.school.name}
                        onChange={(e) => handleDirectPlacementChange('school', 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="school-phone" className="font-medium text-gray-700">
                        Requested School Phone
                      </Label>
                      <Input
                        id="school-phone"
                        value={formData.directPlacement.school.phone}
                        onChange={(e) => handleDirectPlacementChange('school', 'phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                    <Label htmlFor="school-address" className="font-medium text-gray-700">
                      Requested School Address
                    </Label>
                    <Input
                      id="school-address"
                      value={formData.directPlacement.school.address}
                      onChange={(e) => handleDirectPlacementChange('school', 'address', e.target.value)}
                    />
                    </div>
                    <div className="space-y-1 self-end h-8">
                      <button
                        type="button"
                        onClick={() => handleManualEntryToggle('school')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Can't find the address? Enter it manually
                      </button>
                    </div>
                  </div>
                  
                  
                  {formData.directPlacement.school.showManualEntry && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <Label htmlFor="school-address-line1" className="font-medium text-gray-700">
                            Requested School Address Line 1
                          </Label>
                          <Input
                            id="school-address-line1"
                            value={formData.directPlacement.school.addressLine1}
                            onChange={(e) => handleDirectPlacementChange('school', 'addressLine1', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="school-city" className="font-medium text-gray-700">
                            Requested School City
                          </Label>
                          <Input
                            id="school-city"
                            value={formData.directPlacement.school.city}
                            onChange={(e) => handleDirectPlacementChange('school', 'city', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="school-zip" className="font-medium text-gray-700">
                            Requested School Zip
                          </Label>
                          <Input
                            id="school-zip"
                            value={formData.directPlacement.school.zip}
                            onChange={(e) => handleDirectPlacementChange('school', 'zip', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <Label htmlFor="school-address-line2" className="font-medium text-gray-700">
                            Requested School Address Line 2
                          </Label>
                          <Input
                            id="school-address-line2"
                            value={formData.directPlacement.school.addressLine2}
                            onChange={(e) => handleDirectPlacementChange('school', 'addressLine2', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="school-state" className="font-medium text-gray-700 w-full">
                            Requested School State
                          </Label>
                          <Select
                            value={formData.directPlacement.school.state}
                            onValueChange={(value) => handleDirectPlacementChange('school', 'state', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
  
  
        {/* Student Evaluation Section */}
      <Card id="student-evaluation">
        <CardHeader>
          <CardTitle className="text-lg">Student Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
                      {/* Information Box */}
            <Alert variant="info">
              <AlertDescription>
                <div className="space-y-3">
                  <p>
                    Please describe the applicant's character and personality, such as his/her communication skills, emotional stability, curiosity, common sense, maturity and flexibility. Comment on the applicant's strengths and skills. Please also comment on what about this applicant will most likely appeal to a potential host family.
                  </p>
                  <p>
                    <strong>IMPORTANT:</strong> The field below will be used for creating a short bio of the student to present to host families. This is your opportunity to explain what is special and/or unique about the student and what makes him/her stand out. Please provide sufficient detail.
                  </p>
                  <p>
                    This section should be at least 6-8 sentences long.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          
          {/* Student's Character */}
          <div className="space-y-2">
            <Label htmlFor="student-character" className="font-medium text-gray-700">
              Student's Character
            </Label>
            <Textarea
              id="student-character"
              value={formData.studentEvaluation.studentCharacter}
              onChange={(e) => handleStudentEvaluationChange('studentCharacter', e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={1000}
            />
            <p className="text-gray-500">
              {1000 - formData.studentEvaluation.studentCharacter.length} characters remaining
            </p>
          </div>
          
          {/* Interviewer's Comments */}
          <div className="space-y-2">
            <Label htmlFor="interviewer-comments" className="font-medium text-gray-700">
              Interviewer's Comments
            </Label>
            <Textarea
              id="interviewer-comments"
              value={formData.studentEvaluation.interviewerComments}
              onChange={(e) => handleStudentEvaluationChange('interviewerComments', e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={1000}
            />
            <p className="text-gray-500">
              {1000 - formData.studentEvaluation.interviewerComments.length} characters remaining
            </p>
          </div>
          
          {/* Degree of Academic Interest */}
          <div className="space-y-3">
            <Label className="font-medium text-gray-700">
              Degree of academic interest
            </Label>
            <RadioGroup
              value={formData.studentEvaluation.academicInterest}
              onValueChange={(value) => handleStudentEvaluationChange('academicInterest', value)}
              className="flex items-center gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Great" id="academic-great" />
                <Label htmlFor="academic-great" className="font-normal">Great</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Average" id="academic-average" />
                <Label htmlFor="academic-average" className="font-normal">Average</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Little" id="academic-little" />
                <Label htmlFor="academic-little" className="font-normal">Little</Label>
              </div>
            </RadioGroup>
          </div>
          
                      {/* Personality Assessment Information */}
            <Alert variant="info">
              <AlertDescription>
                <p>
                  Please indicate on the scale below how close you believe this student comes to each pair of personality extremes.
                </p>
              </AlertDescription>
            </Alert>
          
          {/* Personality Assessment Grid */}
          <div className="rounded-md p-0 bg-white shadow-sm">
            <div className="space-y-0">
              {/* Header Row */}
              <div className="grid grid-cols-14 gap-2 items-center bg-gray-50 h-12 rounded-t-md">
                <div className="col-span-2"></div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div key={num} className="text-center font-medium text-gray-700">
                    {num}
                  </div>
                ))}
                <div className="col-span-1"></div>
              </div>
              
              {/* Personality Trait Rows */}
              {[
                { key: 'opinionated', left: 'Opinionated', right: 'Open-minded' },
                { key: 'nervous', left: 'Nervous', right: 'Calm' },
                { key: 'shy', left: 'Shy', right: 'Assertive' },
                { key: 'introspective', left: 'Introspective', right: 'Outgoing' },
                { key: 'rigid', left: 'Rigid', right: 'Flexible' },
                { key: 'protected', left: 'Protected', right: 'Independent' },
                { key: 'passive', left: 'Passive', right: 'Talkative' }
              ].map((trait) => (
                <div key={trait.key} className="grid grid-cols-14 items-center border-t border-gray-200 h-12">
                  <div className="col-span-2 text-gray-700 text-right pr-2 align-center">
                    {trait.left}
                  </div>
                  <RadioGroup
                    value={formData.studentEvaluation.personalityTraits[trait.key as keyof typeof formData.studentEvaluation.personalityTraits]}
                    onValueChange={(value) => handlePersonalityTraitChange(trait.key, value)}
                    className="contents"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div key={num} className="flex justify-center">
                        <RadioGroupItem 
                          value={num.toString()} 
                          id={`${trait.key}-${num}`}
                          className="w-4 h-4"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="col-span-2 text-gray-700 text-left pl-2">
                    {trait.right}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* English Comprehension Score Section */}
      <Card id="english-comprehension">
        <CardHeader>
          <CardTitle className="text-lg">English Comprehension Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <Alert variant="info">
            <AlertDescription>
              <p>
                Please select the score (1 to 10) that best describes the student's ability to understand and speak English. Use the guidelines next to each score for your evaluation.
              </p>
            </AlertDescription>
          </Alert>
          
          {/* English Comprehension Score */}
          <div className="space-y-4">
            <Label className="font-medium text-gray-700">English Comprehension Score</Label>
            <RadioGroup
              value={formData.englishComprehension.score}
              onValueChange={(value) => handleEnglishComprehensionChange('score', value)}
              className="space-y-3"
            >
              {[
                { value: '10', label: '10. Absolute proficiency in English. Student is able to both understand and converse. Student thinks in English.' },
                { value: '9', label: '9. Near fluency. Can understand and respond to difficult questions. Has no problems communicating in English.' },
                { value: '8', label: '8. English responses, although not perfect, come easily. Can respond intelligently, but needs practice.' },
                { value: '7', label: '7. Speaking ability is good, but needs practice. Student can go beyond basic responses. Needs to think before responding.' },
                { value: '6', label: '6. Understands basic English. Vocabulary deals with everyday, common terms. Thinks quickly, but it is evident that the student is translating. Can carry on a conversation.' },
                { value: '5', label: '5. Understands much more than the student can communicate; however, makes an effort. Can respond in some sentence forms, even if not perfect.' },
                { value: '4', label: '4. Understands basic English sentences and is able to respond in words. Total immersion in English will improve the student\'s ability to respond.' },
                { value: '3', label: '3. Understands words, but not sentences. Speaking ability is limited to a few words.' },
                { value: '2', label: '2. Has little or no ability to communicate. Student hesitates to use English.' },
                { value: '1', label: '1. No understanding of English.' }
              ].map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.value} id={`english-${option.value}`} className="mt-1.25" />
                  <Label htmlFor={`english-${option.value}`} className="font-normal leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Potential Success Prediction */}
          <div className="space-y-4">
            <Label className="font-medium text-gray-700">
              How would you predict the potential success of this applicant as an exchange student in the United States?
            </Label>
            <RadioGroup
              value={formData.englishComprehension.potentialSuccess}
              onValueChange={(value) => handleEnglishComprehensionChange('potentialSuccess', value)}
              className="flex items-center gap-8"
            >
              {[
                { value: 'very-good', label: 'Very Good Potential' },
                { value: 'good', label: 'Good Potential' },
                { value: 'average', label: 'Average Potential' },
                { value: 'low', label: 'Low Potential' },
                { value: 'no', label: 'No Potential' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`potential-${option.value}`} />
                  <Label htmlFor={`potential-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Interview Report Upload */}
            <div className="space-y-1">
              <Label className="font-medium text-gray-700">
                Interview Report Upload (optional)
              </Label>
              <FileUpload
                accept=".pdf,.doc,.docx"
                maxSize={3 * 1024 * 1024} // 3MB
                formats="DOC, Docx or PDF (max. 3MB)"
                onFileSelect={(file) => handleEnglishComprehensionChange('interviewReport', file)}
                previewPosition="right"
              />
            </div>
          
        </CardContent>
      </Card>
      
    </div>
  );
} 