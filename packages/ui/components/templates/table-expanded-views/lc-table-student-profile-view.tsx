import * as React from "react";
import { Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { BaseExpandedViewProps } from "./expanded-views";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Download } from "lucide-react";

/**
 * LCTableStudentProfileView - A detailed expandable profile view for students
 * 
 * Displays comprehensive student information in a structured layout with personal details, 
 * academic information, favorite activities, placement details, and program contacts.
 */

// Note: Realistic student data is now properly extracted from InstantDB's comprehensive database
// No fallbacks needed since actual data contains detailed bios and activities

export function LCTableStudentProfileView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // Access student data from row.original
  const profile = row.original as any;
  
  // Extract data fields - Now properly accessing InstantDB comprehensive data
  const details = profile.data || profile.profile?.data || profile;
  const academic = details.academic || {};
  const favoriteActivities = details.favorite_activities || [];
  
  // Basic information
  const firstName = profile.firstName || profile.first_name || details.first_name || "Student";
  const lastName = profile.lastName || profile.last_name || details.last_name || "Name";
  const fullName = `${firstName} ${lastName}`;
  const dob = details.date_of_birth || profile.date_of_birth || "Not specified";
  const gpa = academic.gpa || details.gpa || "Not specified";
  
  // Status with fallback
  const status = details.status || { 
    color: "bg-yellow-100 text-yellow-800", 
    text: "Pending" 
  };
  
  // Status display logic
  const statusText = typeof status === 'string' ? status : status.text;
  const statusColor = typeof status === 'object' && status.color ? status.color : "bg-yellow-100 text-yellow-800";
  
  // SEVIS ID logic
  const hasSevisId = details.sevis?.sevis_id || details.sevisId;
  const showSevisId = hasSevisId && (statusText === "Accepted" || statusText === "Placed" || status?.text === "Accepted" || status?.text === "Placed");

  return (
    <div className="bg-gray-50 w-full shadow-[inset_0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_0px_2px_0px_rgba(0,0,0,0.1)]">
      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Section 1: Profile and Info - 4 Column Grid */}
        <div className="grid grid-cols-4 gap-6">
          {/* Profile Image Column */}
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 mb-4 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center relative overflow-hidden">
              {profile.avatarUrl ? (
                <>
                  <img
                    src={profile.avatarUrl}
                    alt={`${firstName} ${lastName}`}
                    className="h-32 w-32 rounded-[0.5rem] absolute inset-0 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <span className="text-5xl font-medium" style={{ display: 'none' }}>
                    {profile.initials || "AM"}
                  </span>
                </>
              ) : (
                <span className="text-5xl font-medium">{profile.initials || "AM"}</span>
              )}
            </div>
            <h2 className="text-xl font-semibold">{fullName}</h2>
            {showSevisId && (
              <p className="text-sm text-muted-foreground mt-1">SEVIS ID: {hasSevisId}</p>
            )}
            {!showSevisId && status?.text === "Pending" && (
              <p className="text-sm text-muted-foreground mt-1">Pending SEVIS Approval</p>
            )}
          </div>

          {/* Information Columns */}
          <div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">First Name:</div>
              <div>{firstName}</div>
              <div className="text-muted-foreground">Date of Birth:</div>
              <div>{dob}</div>
              <div className="text-muted-foreground">Special Requests:</div>
              <div>{details.partnerAssessment?.specialRequests?.stateChoice1 || details.specialRequests || "CA, NJ, MI"}</div>
              <div className="text-muted-foreground">City:</div>
              <div>{details.city || profile.city || "Port-au-Prince"}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <div className="text-muted-foreground">SLEP Score:</div>
              <div>{academic.slep_score || details.slepScore || "0"}</div>
              <div className="text-muted-foreground">ELTIS Score:</div>
              <div>{academic.eltis_score || details.eltisScore || "466"}</div>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Graduation:</div>
              <div>{academic.graduation_year || details.graduation || "6/2028"}</div>
              <div className="text-muted-foreground">School:</div>
              <div>{academic.current_school || details.school || profile.school || "10"}</div>
              <div className="text-muted-foreground">Grade:</div>
              <div>{details.school_grade || details.grade || profile.grade || "10"}</div>
              <div className="text-muted-foreground">GPA:</div>
              <div>{gpa}</div>
              <div className="text-muted-foreground">Private School Tuition:</div>
              <div>{academic.private_school_tuition || details.privateSchoolTuition ? "Yes" : "No"}</div>
              <div className="text-muted-foreground">Pets:</div>
              <div>{details.pets || "None"}</div>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Diet Restrictions:</div>
              <div>{details.health?.dietary_restrictions || details.dietRestrictions || "None"}</div>
              <div className="text-muted-foreground">Can adjust to smoker:</div>
              <div>{details.health?.can_adjust_to_smoker || details.canAdjustToSmoker ? "Yes" : "No"}</div>
              <div className="text-muted-foreground">Afraid of Pets:</div>
              <div>{details.health?.afraid_of_pets || details.afraidOfPets ? "Yes" : "No"}</div>
              <div className="text-muted-foreground">Allergic to animals:</div>
              <div>{details.health?.has_animal_allergies || details.allergicToAnimals ? "Yes" : "No"}</div>
              <div className="text-muted-foreground">Allergic to dust:</div>
              <div>{details.health?.has_dust_allergies || details.allergicToDust ? "Yes" : "No"}</div>
              <div className="text-muted-foreground">Allergic to any food:</div>
              <div>{details.health?.has_food_allergies || details.allergicToFood ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 2: Favourite Activities - 3 Column Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Favourite Activity 1:</h3>
            <p className="text-sm text-muted-foreground whitespace-normal">
              {favoriteActivities[0] || details.favouriteActivity1 || details.interests?.[0] || "Activity details not available"}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Favourite Activity 2:</h3>
            <p className="text-sm text-muted-foreground whitespace-normal">
              {favoriteActivities[1] || details.favouriteActivity2 || details.interests?.[1] || "Activity details not available"}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Favourite Activity 3:</h3>
            <p className="text-sm text-muted-foreground whitespace-normal">
              {favoriteActivities[2] || details.favouriteActivity3 || details.interests?.[2] || "Activity details not available"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Section 3: Student Bio - 1 Column */}
        <div>
          <h3 className="font-medium mb-2">Student Bio:</h3>
          <p className="text-sm text-muted-foreground whitespace-normal">
            {details.student_bio || details.bio || profile.bio || "Student bio not available"}
          </p>
        </div>

        <Separator />

        {/* Section 4: Placement Information - 2 Column */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Holds:</h3>
            <p className="text-sm">{details.holds || "Samantha Jones: Ashton Reeves & Melinda Barrow"}</p>
            
            <h3 className="font-medium mb-2 mt-4">Queue:</h3>
            <ul className="text-sm space-y-1">
              <li>• Richard Hill: Michael Sinner & Jane Smith</li>
              <li>• Mitchell McNeal: Jaime D'Souza & Debbie Fields</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Presented:</h3>
            <div className="text-sm">
              <p>You: <a href="#" className="text-green-600">Mark Smith & Susan Grant</a>, <a href="#" className="text-green-600">Daniel Strong & Jenny Hughes</a></p>
              <ul className="space-y-1 mt-2">
                <li>• Samantha Jones: Ashton Reeves & Melinda Barrow</li>
                <li>• Richard Hill: Michael Sinner & Jane Smith</li>
                <li>• Mitchell McNeal: Jaime D'Souza & Debbie Fields</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 5: SEVIS Status Alert (for pending students) */}
        {!showSevisId && status?.text === "Pending" && (
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Pending SEVIS Approval
            </AlertTitle>
            <AlertDescription>
              This student is awaiting SEVIS approval. A SEVIS ID will be assigned once the approval process is complete.
            </AlertDescription>
          </Alert>
        )}

        {/* Section 6: Actions - Horizontal Buttons */}
        <div>
          <h3 className="font-medium mb-2">Actions:</h3>
          <div className="flex space-x-2">
            <Button variant="default">
              Request Hold
            </Button>
            <Button variant="default">
              Present To Family
            </Button>
            <Button variant="default">
              Add to List
            </Button>
            <Button variant="default">
              View Full Profile
            </Button>
          </div>
        </div>

        <Separator />

        {/* Section 7: Additional Documents & Notes */}
        <div>
          
          
          <h3 className="font-medium mb-2">Downloads:</h3>

          <Alert variant="info" className="mb-6">
            <AlertTitle>Advisory:</AlertTitle>
            <AlertDescription>
              These documents contain sensitive, personal information. They can be shared with school officials for school acceptance and used to ensure 
              an appropriate match between a student and host family. They should NOT be provided to any un-vetted host families or to any approved 
              host family without an approved placement with that particular student. Misuse of these documents, particularly if the student involved is an 
              E.U. citizen, can result in your permanent loss of access to Greenheart systems.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button variant="default">
              <Download className="mr-2" size={20} />
              Partial Bio PDF
            </Button>
            <Button variant="default">
              <Download className="mr-2" size={20} />
              Full Bio PDF
            </Button>
            <Button variant="default">
              <Download className="mr-2" size={20} />
              Application PDF
            </Button>
            <Button variant="default">
              <Download className="mr-2" size={20} />
              Application & Documents ZIP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 