import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AdvancedPinnedTable } from "../ui/advanced-pinned-table";
import { createActionsColumn } from "../ui/advanced-pinned-table";
import { ExpandedViewType } from "../templates/table-expanded-views/expanded-views";
import { Checkbox } from "../ui/checkbox";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Example student data
const studentData = [
  {
    id: "STU001",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    program: "Computer Science",
    year: "2nd Year",
    gpa: 3.8,
    status: { text: "Active", color: "green" }
  },
  {
    id: "STU002",
    name: "John Doe",
    email: "john.doe@example.com",
    program: "Electrical Engineering",
    year: "3rd Year",
    gpa: 3.5,
    status: { text: "Active", color: "green" }
  },
  {
    id: "STU003",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    program: "Mathematics",
    year: "1st Year",
    gpa: 3.9,
    status: { text: "Active", color: "green" }
  }
];

// Example course data
const courseData = [
  {
    id: "CRS001",
    code: "CS101",
    title: "Introduction to Programming",
    department: "Computer Science",
    credits: 3,
    instructor: "Dr. Jane Smith",
    enrollment: 32,
    capacity: 40,
    status: { text: "Open", color: "green" }
  },
  {
    id: "CRS002",
    code: "EE201",
    title: "Circuit Analysis",
    department: "Electrical Engineering",
    credits: 4,
    instructor: "Dr. Robert Johnson",
    enrollment: 28,
    capacity: 30,
    status: { text: "Closed", color: "red" }
  },
  {
    id: "CRS003",
    code: "MATH151",
    title: "Calculus I",
    department: "Mathematics",
    credits: 4,
    instructor: "Dr. Sarah Lee",
    enrollment: 35,
    capacity: 40,
    status: { text: "Open", color: "green" }
  }
];

// Example instructor data
const instructorData = [
  {
    id: "INS001",
    name: "Dr. Jane Smith",
    department: "Computer Science",
    position: "Associate Professor",
    email: "jsmith@example.edu",
    phone: "(123) 456-7890",
    office: "Science Building, Room 405",
    courses: 3,
    status: { text: "Active", color: "green" }
  },
  {
    id: "INS002",
    name: "Dr. Robert Johnson",
    department: "Electrical Engineering",
    position: "Professor",
    email: "rjohnson@example.edu",
    phone: "(123) 456-7891",
    office: "Engineering Building, Room 305",
    courses: 2,
    status: { text: "Active", color: "green" }
  },
  {
    id: "INS003",
    name: "Dr. Sarah Lee",
    department: "Mathematics",
    position: "Assistant Professor",
    email: "slee@example.edu",
    phone: "(123) 456-7892",
    office: "Math Building, Room 205",
    courses: 4,
    status: { text: "On Leave", color: "amber" }
  }
];

// Example program data
const programData = [
  {
    id: "PRG001",
    name: "Bachelor of Science in Computer Science",
    code: "BSCS",
    department: "Computer Science",
    degree: "Bachelor's",
    totalStudents: 245,
    newStudents: 78,
    graduatingStudents: 52,
    status: { text: "Active", color: "green" }
  },
  {
    id: "PRG002",
    name: "Master of Science in Computer Science",
    code: "MSCS",
    department: "Computer Science",
    degree: "Master's",
    totalStudents: 120,
    newStudents: 45,
    graduatingStudents: 35,
    status: { text: "Active", color: "green" }
  },
  {
    id: "PRG003",
    name: "Bachelor of Science in Electrical Engineering",
    code: "BSEE",
    department: "Electrical Engineering",
    degree: "Bachelor's",
    totalStudents: 200,
    newStudents: 65,
    graduatingStudents: 48,
    status: { text: "Active", color: "green" }
  }
];

// Define columns for students
const studentColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enablePinning: true,
  },
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => row.toggleExpanded()}
          className="h-8 w-8 p-0"
        >
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "" : "-rotate-90"}`}
          />
        </Button>
      )
    },
    enableSorting: false,
    enablePinning: true,
  },
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    enablePinning: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    enablePinning: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    accessorKey: "program",
    header: "Program",
    enableSorting: true,
  },
  {
    accessorKey: "year",
    header: "Year",
    enableSorting: true,
  },
  {
    accessorKey: "gpa",
    header: "GPA",
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as { text: string; color: string };
      return (
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
      );
    },
  },
  createActionsColumn([
    {
      label: "View Profile",
                  onClick: (row) => {},
    },
    {
      label: "Edit",
      onClick: (row) => console.log("Edit student", row),
    },
    {
      label: "Delete",
      onClick: (row) => console.log("Delete student", row),
    },
  ]),
];

// Define columns for courses
const courseColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enablePinning: true,
  },
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => row.toggleExpanded()}
          className="h-8 w-8 p-0"
        >
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "" : "-rotate-90"}`}
          />
        </Button>
      )
    },
    enableSorting: false,
    enablePinning: true,
  },
  {
    accessorKey: "code",
    header: "Code",
    enableSorting: true,
    enablePinning: true,
  },
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    enablePinning: true,
  },
  {
    accessorKey: "department",
    header: "Department",
    enableSorting: true,
  },
  {
    accessorKey: "credits",
    header: "Credits",
    enableSorting: true,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    enableSorting: true,
  },
  {
    accessorKey: "enrollment",
    header: "Enrollment",
    enableSorting: true,
    cell: ({ row }) => {
      const enrollment = row.getValue("enrollment") as number;
      const capacity = row.getValue("capacity") as number;
      return `${enrollment}/${capacity}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as { text: string; color: string };
      return (
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
      );
    },
  },
  createActionsColumn([
    {
      label: "View Details",
      onClick: (row) => console.log("View course details", row),
    },
    {
      label: "Edit",
      onClick: (row) => console.log("Edit course", row),
    },
    {
      label: "Delete",
      onClick: (row) => console.log("Delete course", row),
    },
  ]),
];

// Example status filters for students
const studentStatusFilters = [
  {
    id: "active",
    label: "Active",
    field: "status.text",
    value: "Active",
    color: "green"
  },
  {
    id: "inactive",
    label: "Inactive",
    field: "status.text",
    value: "Inactive",
    color: "red"
  },
  {
    id: "probation",
    label: "Probation",
    field: "status.text",
    value: "Probation",
    color: "amber"
  }
];

export function ExpandableTablesExample() {
  // State to track which type of data to display
  const [dataType, setDataType] = React.useState<ExpandedViewType>("student");
  
  // Get the appropriate data and columns based on the current type
  const getTableProps = () => {
    switch (dataType) {
      case "student":
        return {
          data: studentData,
          columns: studentColumns,
          statusFilters: studentStatusFilters,
          expandedViewType: "student" as ExpandedViewType
        };
      case "course":
        return {
          data: courseData,
          columns: courseColumns,
          statusFilters: [],
          expandedViewType: "course" as ExpandedViewType
        };
      case "instructor":
        return {
          data: instructorData,
          columns: studentColumns, // Reusing student columns for simplicity
          statusFilters: [],
          expandedViewType: "instructor" as ExpandedViewType
        };
      case "program":
        return {
          data: programData,
          columns: studentColumns, // Reusing student columns for simplicity
          statusFilters: [],
          expandedViewType: "program" as ExpandedViewType
        };
      default:
        return {
          data: studentData,
          columns: studentColumns,
          statusFilters: studentStatusFilters,
          expandedViewType: "student" as ExpandedViewType
        };
    }
  };
  
  const { data, columns, statusFilters, expandedViewType } = getTableProps();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant={dataType === "student" ? "default" : "outline"} 
          onClick={() => setDataType("student")}
        >
          Students
        </Button>
        <Button 
          variant={dataType === "course" ? "default" : "outline"} 
          onClick={() => setDataType("course")}
        >
          Courses
        </Button>
        <Button 
          variant={dataType === "instructor" ? "default" : "outline"} 
          onClick={() => setDataType("instructor")}
        >
          Instructors
        </Button>
        <Button 
          variant={dataType === "program" ? "default" : "outline"}
          onClick={() => setDataType("program")}
        >
          Programs
        </Button>
      </div>
      
      <AdvancedPinnedTable
        data={data}
        columns={columns}
        defaultPinnedColumns={{
          left: ["select", "expander", "id", "name", "code", "title"],
          right: ["actions"]
        }}
        enableSearch={true}
        enableStatusFilter={dataType === "student"}
        statusFilters={statusFilters}
        enableFilters={true}
        autoGenerateFilters={true}
        expandedViewType={expandedViewType}
        bulkActions={[
          {
            label: "Export Selected",
            onClick: (rows) => console.log("Export selected", rows),
          },
          {
            label: "Delete Selected",
            onClick: (rows) => console.log("Delete selected", rows),
          },
        ]}
      />
    </div>
  );
} 