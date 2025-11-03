import { ReactNode, useState } from 'react'
import { PageLayout } from './PageLayout'
import { Check, ChevronDown } from 'lucide-react'

// Example logo component
const Logo = () => (
  <div className="text-2xl font-bold">EGAB</div>
)

// Example sidebar content
const SidebarContent = () => (
  <div>Sidebar content goes here</div>
)

// Example right sidebar content
const RightSidebarContent = () => (
  <div>Right sidebar content</div>
)

// User area component
const UserArea = ({ userName, userImage }: { userName: string, userImage: string }) => (
  <div className="flex items-center gap-4 justify-end">
    <div className="flex flex-col items-end">
      <span className="font-medium">{userName}</span>
    </div>
    <img src={userImage} alt={userName} className="w-10 h-10 rounded-full" />
    <button className="ml-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
)

// Example 1: Simple Greeting Header
export function GreetingPageExample() {
  return (
    <PageLayout
      headerType="greeting"
      headerProps={{
        greeting: "Hi",
        names: "David & Melissa"
      }}
      logo={<Logo />}
      leftSidebarContent={<SidebarContent />}
      headerUserArea={
        <UserArea 
          userName="David Jenkins" 
          userImage="/path-to-image.jpg"
        />
      }
      rightSidebarContent={<RightSidebarContent />}
      isRightSidebarOpen={true}
      onRightSidebarToggle={() => {}}
    >
      <div>Main content goes here</div>
    </PageLayout>
  )
}

// Example 2: Profile Header with Tags
export function ProfilePageExample() {
  return (
    <PageLayout
      headerType="profile"
      headerProps={{
        name: "Bessie Cooper",
        tags: [
          { id: "1", label: "J-1HS 2025-2026" },
          { id: "2", label: "1st Semester" },
          { id: "3", label: "CA, NJ, MI" }
        ],
        status: { label: "RD Approval", type: "default" }
      }}
      logo={<Logo />}
      leftSidebarContent={<SidebarContent />}
      headerUserArea={
        <UserArea 
          userName="Bryan Green" 
          userImage="/path-to-image.jpg"
        />
      }
      rightSidebarContent={<RightSidebarContent />}
      isRightSidebarOpen={true}
      onRightSidebarToggle={() => {}}
    >
      <div>Main content goes here</div>
    </PageLayout>
  )
}

// Example 3: Action Header with Buttons
export function ActionPageExample() {
  return (
    <PageLayout
      headerType="action"
      headerProps={{
        title: "David Jenkins & Melissa Seymour",
        tags: [
          { id: "1", label: "J-1HS 2025-2026" }
        ],
        status: { label: "RD Review", type: "default" },
        navigationControls: true,
        actionButtons: [
          { id: "1", label: "Save Draft", variant: "outline", onClick: () => {} },
          { id: "2", label: "Send Feedback", variant: "outline", onClick: () => {} },
          { id: "3", label: "Approve", variant: "default", icon: <Check className="w-4 h-4" />, onClick: () => {} }
        ]
      }}
      logo={<Logo />}
      leftSidebarContent={<SidebarContent />}
      headerUserArea={
        <UserArea 
          userName="Bryan Green" 
          userImage="/path-to-image.jpg"
        />
      }
      rightSidebarContent={<RightSidebarContent />}
      isRightSidebarOpen={true}
      onRightSidebarToggle={() => {}}
    >
      <div>Main content goes here</div>
    </PageLayout>
  )
}

// Example 4: Year Selector Header
export function YearSelectorPageExample() {
  const [selectedYear, setSelectedYear] = useState("2025-2026")
  const years = ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028"]
  
  return (
    <PageLayout
      headerType="yearSelector"
      headerProps={{
        title: "Academic Year",
        subtitle: "Select the academic year to view",
        currentYear: selectedYear,
        years: years,
        onYearChange: setSelectedYear,
        actionButtons: [
          { id: "1", label: "Export Data", variant: "outline", onClick: () => {} },
          { id: "2", label: "Settings", variant: "ghost", onClick: () => {} }
        ]
      }}
      logo={<Logo />}
      leftSidebarContent={<SidebarContent />}
      headerUserArea={
        <UserArea 
          userName="Bryan Green" 
          userImage="/path-to-image.jpg"
        />
      }
      rightSidebarContent={<RightSidebarContent />}
      isRightSidebarOpen={true}
      onRightSidebarToggle={() => {}}
    >
      <div>Content for academic year {selectedYear}</div>
    </PageLayout>
  )
}

// Example 5: Custom Header (Legacy support)
export function CustomHeaderExample() {
  const CustomHeader = () => (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-2xl font-bold">Custom Header</h2>
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Custom Button
        </button>
      </div>
    </div>
  )

  return (
    <PageLayout
      headerType="custom"
      headerInfo={<CustomHeader />}
      logo={<Logo />}
      leftSidebarContent={<SidebarContent />}
      headerUserArea={
        <UserArea 
          userName="Bryan Green" 
          userImage="/path-to-image.jpg"
        />
      }
      rightSidebarContent={<RightSidebarContent />}
      isRightSidebarOpen={true}
      onRightSidebarToggle={() => {}}
    >
      <div>Content with custom header</div>
    </PageLayout>
  )
} 