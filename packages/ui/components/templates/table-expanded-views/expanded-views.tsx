import * as React from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { cn } from "../../../lib/utils";
import { LCTableStudentProfileView } from './lc-table-student-profile-view';
import { SevisUserTableStudentProfileView } from './sevis-user-table-student-profile-view';
import { SevisProcessingStudentView } from './sevis-processing-student-view';

// Types for different expanded views
export type ExpandedViewType = 
  | "student" 
  | "sevis-student"
  | "course" 
  | "instructor" 
  | "program" 
  | "default";

// Interface for base props that all expanded views will accept
export interface BaseExpandedViewProps<TData> {
  row: Row<TData>;
  containerWidth?: number;
}

// Student expanded view
export function StudentExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // Access student data from row
  const student = row.original as any;
  
  return (
    <div className="p-6 grid grid-cols-3 gap-6 w-full">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center relative overflow-hidden">
            {student.avatar ? (
              <>
                <img
                  src={student.avatar}
                  alt={student.name || "Student"}
                  className="h-16 w-16 rounded-[0.5rem] absolute inset-0 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span className="text-lg font-medium" style={{ display: 'none' }}>
                  {student.name ? student.name.charAt(0) : "S"}
                </span>
              </>
            ) : (
              <span className="text-lg font-medium">{student.name ? student.name.charAt(0) : "S"}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{student.name || "Student Name"}</h3>
            <p className="text-sm text-muted-foreground">ID: {student.id || "STU-1234"}</p>
            <div className="mt-2">
              <Badge variant="outline" className="mr-1">
                {student.program || "Bachelor's Program"}
              </Badge>
              <Badge variant="outline">
                {student.year || "Year 1"}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Contact Information</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span>{student.email || "student@example.com"}</span>
            <span className="text-muted-foreground">Phone:</span>
            <span>{student.phone || "(123) 456-7890"}</span>
            <span className="text-muted-foreground">Address:</span>
            <span>{student.address || "123 University Way"}</span>
          </div>
        </div>
      </div>
      
      {/* Academic Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Academic Information</h4>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">GPA:</span>
          <span>{student.gpa || "3.75"}</span>
          <span className="text-muted-foreground">Credits Completed:</span>
          <span>{student.credits || "45"} / 120</span>
          <span className="text-muted-foreground">Academic Status:</span>
          <span>
            <Badge variant={student.academicStatus === "Good Standing" ? "chip-green" : "chip-amber"}>
              {student.academicStatus || "Good Standing"}
            </Badge>
          </span>
          <span className="text-muted-foreground">Advisor:</span>
          <span>{student.advisor || "Dr. Smith"}</span>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Courses</h4>
          <ul className="space-y-1 text-sm">
            {(student.courses || ["Introduction to Programming", "Calculus I", "World History"]).map((course: string, index: number) => (
              <li key={index} className="flex justify-between">
                <span>{course}</span>
                <Badge variant="chip-gray" className="text-xs">In Progress</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm">View Profile</Button>
            <Button variant="secondary" size="sm">Send Email</Button>
            <Button variant="secondary" size="sm">Edit Details</Button>
            <Button variant="secondary" size="sm">Add Note</Button>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full">Schedule Meeting</Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2 text-sm">
            <div className="rounded-md bg-muted p-2">
              <span className="text-xs text-muted-foreground">Yesterday</span>
              <p>Submitted course registration for Fall 2023</p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <span className="text-xs text-muted-foreground">3 days ago</span>
              <p>Attended academic advising session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Course expanded view
export function CourseExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // Access course data from row
  const course = row.original as any;
  
  return (
    <div className="p-6 grid grid-cols-3 gap-6 w-full">
      {/* Course Details Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{course.title || "Course Title"}</h3>
          <p className="text-sm text-muted-foreground">Code: {course.code || "CS-101"}</p>
          <div className="mt-2">
            <Badge variant="outline" className="mr-1">
              {course.department || "Computer Science"}
            </Badge>
            <Badge variant="outline">
              {course.credits || "3"} Credits
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Course Description</h4>
          <p className="text-sm">
            {course.description || "This course provides an introduction to the fundamental concepts of programming and computer science. Students will learn problem-solving techniques and develop solutions using a modern programming language."}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Prerequisites</h4>
          <p className="text-sm">
            {course.prerequisites || "None"}
          </p>
        </div>
      </div>
      
      {/* Schedule & Instructors Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Schedule Information</h4>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Term:</span>
          <span>{course.term || "Fall 2023"}</span>
          <span className="text-muted-foreground">Days:</span>
          <span>{course.days || "Mon, Wed, Fri"}</span>
          <span className="text-muted-foreground">Time:</span>
          <span>{course.time || "10:00 AM - 11:30 AM"}</span>
          <span className="text-muted-foreground">Location:</span>
          <span>{course.location || "Science Building, Room 305"}</span>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Instructors</h4>
          <div className="space-y-2">
            {(course.instructors || [
              { name: "Dr. Jane Smith", email: "jsmith@university.edu" },
              { name: "Prof. Robert Johnson", email: "rjohnson@university.edu" }
            ]).map((instructor: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {instructor.name ? instructor.name.charAt(0) : "I"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{instructor.name}</p>
                  <p className="text-xs text-muted-foreground">{instructor.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Enrollment & Actions Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Course Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Enrollment:</span>
              <span className="text-sm font-medium">{course.enrollment || "32"} / {course.capacity || "40"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Waitlist:</span>
              <span className="text-sm font-medium">{course.waitlist || "5"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={course.status === "Open" ? "chip-green" : "chip-red"}>
                {course.status || "Open"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 pt-2">
            <Button className="w-full" variant="secondary" size="sm">View Syllabus</Button>
            <Button className="w-full" variant="secondary" size="sm">Class List</Button>
            <Button className="w-full" variant="secondary" size="sm">Edit Details</Button>
            <Button className="w-full" variant="secondary" size="sm">Send Notification</Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Important Dates</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Add/Drop Deadline:</span>
              <span>{course.addDropDeadline || "Sep 15, 2023"}</span>
            </div>
            <div className="flex justify-between">
              <span>Midterm Exam:</span>
              <span>{course.midtermDate || "Oct 20, 2023"}</span>
            </div>
            <div className="flex justify-between">
              <span>Final Exam:</span>
              <span>{course.finalExamDate || "Dec 15, 2023"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Instructor expanded view
export function InstructorExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // Access instructor data from row
  const instructor = row.original as any;
  
  return (
    <div className="p-6 grid grid-cols-3 gap-6 w-full">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] bg-gray-200 flex items-center justify-center relative overflow-hidden">
            {instructor.avatar ? (
              <>
                <img
                  src={instructor.avatar}
                  alt={instructor.name || "Instructor"}
                  className="h-16 w-16 rounded-[0.5rem] absolute inset-0 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span className="text-lg font-medium" style={{ display: 'none' }}>
                  {instructor.name ? instructor.name.charAt(0) : "I"}
                </span>
              </>
            ) : (
              <span className="text-lg font-medium">{instructor.name ? instructor.name.charAt(0) : "I"}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{instructor.name || "Dr. Jane Smith"}</h3>
            <p className="text-sm text-muted-foreground">ID: {instructor.id || "INS-789"}</p>
            <div className="mt-2">
              <Badge variant="outline" className="mr-1">
                {instructor.department || "Computer Science"}
              </Badge>
              <Badge variant="outline">
                {instructor.position || "Associate Professor"}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Contact Information</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span>{instructor.email || "jsmith@university.edu"}</span>
            <span className="text-muted-foreground">Phone:</span>
            <span>{instructor.phone || "(123) 456-7890"}</span>
            <span className="text-muted-foreground">Office:</span>
            <span>{instructor.office || "Science Building, Room 405"}</span>
          </div>
        </div>
      </div>
      
      {/* Teaching Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Current Teaching Load</h4>
        <div className="space-y-2 text-sm">
          {(instructor.courses || [
            { code: "CS-101", title: "Introduction to Programming", students: 35 },
            { code: "CS-301", title: "Data Structures", students: 28 },
            { code: "CS-401", title: "Advanced Algorithms", students: 22 }
          ]).map((course: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
              <div>
                <p className="font-medium">{course.code}: {course.title}</p>
                <p className="text-xs text-muted-foreground">Enrolled: {course.students} students</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Office Hours</h4>
          <div className="space-y-1">
            {(instructor.officeHours || [
              { day: "Monday", time: "1:00 PM - 3:00 PM" },
              { day: "Wednesday", time: "10:00 AM - 12:00 PM" },
              { day: "Friday", time: "2:00 PM - 4:00 PM" }
            ]).map((hours: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{hours.day}:</span>
                <span>{hours.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm">View Profile</Button>
            <Button variant="secondary" size="sm">Send Email</Button>
            <Button variant="secondary" size="sm">Edit Details</Button>
            <Button variant="secondary" size="sm">View Schedule</Button>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full">Schedule Meeting</Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2 text-sm">
            <div className="rounded-md bg-muted p-2">
              <span className="text-xs text-muted-foreground">Yesterday</span>
              <p>Submitted final grades for CS-301</p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <span className="text-xs text-muted-foreground">3 days ago</span>
              <p>Updated syllabus for CS-101</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Program expanded view
export function ProgramExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  // Access program data from row
  const program = row.original as any;
  
  return (
    <div className="p-6 grid grid-cols-3 gap-6 w-full">
      {/* Program Details Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{program.name || "Bachelor of Science in Computer Science"}</h3>
          <p className="text-sm text-muted-foreground">Code: {program.code || "BSCS"}</p>
          <div className="mt-2">
            <Badge variant="outline" className="mr-1">
              {program.department || "Computer Science"}
            </Badge>
            <Badge variant="outline">
              {program.degree || "Bachelor's"} Degree
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Program Description</h4>
          <p className="text-sm">
            {program.description || "This program provides a comprehensive education in computer science, covering programming, algorithms, data structures, software engineering, and more. Graduates will be prepared for careers in software development, system administration, and other computing fields."}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Program Requirements</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Credits Required:</span>
              <span>{program.totalCredits || "120"}</span>
            </div>
            <div className="flex justify-between">
              <span>Core Credits:</span>
              <span>{program.coreCredits || "60"}</span>
            </div>
            <div className="flex justify-between">
              <span>Elective Credits:</span>
              <span>{program.electiveCredits || "30"}</span>
            </div>
            <div className="flex justify-between">
              <span>General Education Credits:</span>
              <span>{program.genEdCredits || "30"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enrollment & Faculty Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Enrollment Statistics</h4>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Total Students:</span>
          <span>{program.totalStudents || "245"}</span>
          <span className="text-muted-foreground">New Students (This Year):</span>
          <span>{program.newStudents || "78"}</span>
          <span className="text-muted-foreground">Graduating Students:</span>
          <span>{program.graduatingStudents || "52"}</span>
          <span className="text-muted-foreground">Average GPA:</span>
          <span>{program.averageGPA || "3.42"}</span>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Program Faculty</h4>
          <div className="space-y-2">
            {(program.faculty || [
              { name: "Dr. Robert Johnson", position: "Program Director" },
              { name: "Dr. Sarah Lee", position: "Senior Professor" },
              { name: "Dr. Michael Chen", position: "Associate Professor" }
            ]).map((faculty: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">{faculty.name}</p>
                  <p className="text-xs text-muted-foreground">{faculty.position}</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Actions & Outcomes Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Program Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm">View Curriculum</Button>
            <Button variant="secondary" size="sm">Student List</Button>
            <Button variant="secondary" size="sm">Faculty List</Button>
            <Button variant="secondary" size="sm">Edit Program</Button>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full">Generate Reports</Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Outcomes & Placement</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Employment Rate:</span>
              <span>{program.employmentRate || "92%"}</span>
            </div>
            <div className="flex justify-between">
              <span>Graduate Study Rate:</span>
              <span>{program.gradStudyRate || "15%"}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Starting Salary:</span>
              <span>{program.avgStartingSalary || "$72,500"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default expanded view for fallback
export function DefaultExpandedView<TData>({ 
  row, 
  containerWidth 
}: BaseExpandedViewProps<TData>) {
  return (
    <div className="p-6 grid grid-cols-3 gap-6 w-full">
      <div>
        <h4 className="font-medium mb-2">Details</h4>
        <div className="space-y-1 text-sm">
          <p>Additional details for this item.</p>
          <p>This is a student in the international exchange program system.</p>
          <p>Student information includes academic background, interests, and program details.</p>
          <p>For more detailed information, please expand the student profile view.</p>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Information</h4>
        <div className="space-y-1 text-sm">
          <p>Academic performance and program participation details.</p>
          <p>Language proficiency and cultural background information.</p>
          <p>Host family preferences and placement requirements.</p>
          <p>Program timeline and academic requirements.</p>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm">View Details</Button>
          <Button variant="secondary" size="sm">Edit</Button>
          <Button variant="secondary" size="sm">Delete</Button>
          <Button variant="secondary" size="sm">Export</Button>
        </div>
      </div>
    </div>
  );
}

// Factory function to get the appropriate expanded view based on type
export function getExpandedView(viewType: ExpandedViewType = "default") {
  switch (viewType) {
    case "student":
      return SevisUserTableStudentProfileView;
    case "sevis-student":
      return SevisProcessingStudentView;
    case "course":
      return CourseExpandedView;
    case "instructor":
      return InstructorExpandedView;
    case "program":
      return ProgramExpandedView;
    default:
      return DefaultExpandedView;
  }
} 