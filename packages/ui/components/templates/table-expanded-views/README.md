# Table Expanded View Templates

This directory contains templates for the expandable content in tables. These templates provide standardized layouts for different data types when a table row is expanded.

## Available Templates

### StudentExpandedView
Displays detailed information about a student, including:
- Profile and contact information
- Academic information and status
- Current courses
- Quick actions and recent activity

### CourseExpandedView
Displays detailed information about a course, including:
- Course details and description
- Schedule and instructor information
- Enrollment statistics
- Important dates and quick actions

### InstructorExpandedView
Displays detailed information about an instructor, including:
- Profile and contact information
- Current teaching load
- Office hours
- Quick actions and recent activity

### ProgramExpandedView
Displays detailed information about an academic program, including:
- Program details and description
- Enrollment statistics
- Faculty information
- Outcomes and placement statistics

### DefaultExpandedView
A fallback view with a generic layout when no specific template is provided.

## Usage

Import the templates directly or use the `getExpandedView` helper function:

```tsx
import { AdvancedPinnedTable } from "../ui/advanced-pinned-table";
import { ExpandedViewType } from "../templates/table-expanded-views/expanded-views";

// Use the expanded view type
<AdvancedPinnedTable
  data={data}
  columns={columns}
  expandedViewType="student"
/>
```

Or import specific templates directly:

```tsx
import { StudentExpandedView } from "../templates/table-expanded-views/expanded-views";

// Create a custom render function
const renderExpandedContent = ({ row }) => (
  <StudentExpandedView row={row} />
);

<AdvancedPinnedTable
  data={data}
  columns={columns}
  renderExpandedContent={renderExpandedContent}
/>
``` 