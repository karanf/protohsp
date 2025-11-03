import { ReactNode, useState } from 'react'
import { cn } from '@repo/ui/lib/utils'
import { ChevronsRight, Bell, Inbox, Calendar, Megaphone } from 'lucide-react'
import { 
  GreetingHeader, 
  ProfileHeader,
  ActionHeader,
  YearSelectorHeader,
  StudentApplicationHeader,
  HeaderUserArea
} from '@repo/ui/components/templates/HeaderTemplates'
import { Avatar, AvatarImage, AvatarFallback, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui'
import { RightSidebar } from './RightSidebar'
import { LeftSidebar, NavigationType } from './LeftSidebar'
import Image from 'next/image'

// Define header types
export type HeaderType = 'greeting' | 'profile' | 'action' | 'yearSelector' | 'studentApplication' | 'custom'

// Base interface for all header props
interface BaseHeaderLayoutProps {
  /** Logo component to be displayed in the sidebar */
  logo?: ReactNode
  /** Content to be displayed in the left sidebar */
  leftSidebarContent?: ReactNode
  /** Type of navigation to display in the left sidebar */
  navigationType?: NavigationType
  /** Currently active route */
  activeRoute?: string
  /** Content to be displayed in the header user area */
  headerUserArea?: ReactNode
  /** Content to be displayed in the right sidebar */
  rightSidebarContent?: ReactNode
  /** Main content to be rendered */
  children: ReactNode
  /** Whether the right sidebar is open */
  isRightSidebarOpen?: boolean
  /** Callback function when right sidebar toggle is clicked */
  onRightSidebarToggle?: () => void
  /** Additional className for the main content area */
  className?: string
  /** Currently active tab in the right sidebar */
  activeTab?: string
  /** Callback function when tab is changed */
  setActiveTab?: (tab: string) => void
}

// Header-specific interfaces
interface GreetingHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'greeting'
  headerProps: {
    greeting: string
    names: string
    className?: string
  }
}

interface ProfileHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'profile'
  headerProps: {
    name: string
    tags?: Array<{
      id: string
      label: string
    }>
    status?: {
      label: string
      type?: 'default' | 'warning' | 'error' | 'success' | 'info'
    }
    actions?: ReactNode
    className?: string
  }
}

interface ActionHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'action'
  headerProps: {
    title: string
    subtitle?: string
    tags?: Array<{
      id: string
      label: string
    }>
    status?: {
      label: string
      type?: 'default' | 'secondary' | 'destructive' | 'outline'
    }
    navigationControls?: boolean
    actionButtons?: Array<{
      id: string
      label: string
      icon?: ReactNode
      onClick?: () => void
      variant?: 'default' | 'outline' | 'ghost'
    }>
    className?: string
  }
}

interface YearSelectorHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'yearSelector'
  headerProps: {
    title: string
    subtitle?: string
    currentYear: string
    years: string[]
    onYearChange: (year: string) => void
    actionButtons?: Array<{
      id: string
      label: string
      icon?: ReactNode
      onClick?: () => void
      variant?: 'default' | 'secondary' | 'destructive' | 'tertiary' | 'outline' | 'ghost' | 'link'
    }>
    className?: string
  }
}

interface StudentApplicationHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'studentApplication'
  headerProps: {
    studentName: string
    program: string
    status: string
    avatarUrl?: string
    tags?: Array<{
      id: string
      label: string
    }>
    actionButtons?: Array<{
      id: string
      label: string
      icon?: ReactNode
      onClick?: () => void
      variant?: 'default' | 'secondary' | 'destructive' | 'tertiary' | 'outline' | 'ghost' | 'link'
    }>
    className?: string
    isLoading?: boolean
  }
}

interface CustomHeaderLayoutProps extends BaseHeaderLayoutProps {
  headerType: 'custom'
  headerInfo: ReactNode
}

// Union of all possible layout props
export type PageLayoutProps = 
  | GreetingHeaderLayoutProps 
  | ProfileHeaderLayoutProps 
  | ActionHeaderLayoutProps 
  | YearSelectorHeaderLayoutProps 
  | StudentApplicationHeaderLayoutProps
  | CustomHeaderLayoutProps

/**
 * PageLayout component that provides a consistent layout structure with sidebars and header
 */
export function PageLayout(props: PageLayoutProps) {
  const {
    children,
    logo,
    leftSidebarContent,
    navigationType = 'student',
    activeRoute = '/',
    headerUserArea,
    isRightSidebarOpen = false,
    onRightSidebarToggle,
    activeTab: externalActiveTab = 'inbox',
    setActiveTab: externalSetActiveTab,
    className,
    headerType,
    rightSidebarContent
  } = props;

  const [isOpen, setIsOpen] = useState(isRightSidebarOpen);
  const [internalActiveTab, setInternalActiveTab] = useState(externalActiveTab);

  const handleRightSidebarToggle = () => {
    setIsOpen(!isOpen);
    onRightSidebarToggle?.();
  };

  const handleTabChange = (tab: string) => {
    setInternalActiveTab(tab);
    externalSetActiveTab?.(tab);
  };

  // Use external tab if provided, otherwise use internal state
  const activeTab = externalSetActiveTab ? externalActiveTab : internalActiveTab;

  // Render the appropriate header based on the headerType
  const renderHeader = () => {
    switch (headerType) {
      case 'greeting':
        return (
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">Welcome back!</h1>
            <p className="text-sm text-gray-500">Here's what's happening today.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatars/01.png" alt={props.headerProps.name} />
              <AvatarFallback>{props.headerProps.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{props.headerProps.name}</h2>
              {props.headerProps.status && (
                <Badge variant={props.headerProps.status.type === 'warning' ? 'destructive' : 'default'}>
                  {props.headerProps.status.label}
                </Badge>
              )}
            </div>
          </div>
        );
      case 'action':
        return (
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold">{props.headerProps.title}</h2>
              {props.headerProps.subtitle && (
                <p className="text-sm text-gray-500">{props.headerProps.subtitle}</p>
              )}
            </div>
            {props.headerProps.actionButtons && (
              <div className="flex items-center space-x-2">
                {props.headerProps.actionButtons.map((button) => (
                  <Button
                    key={button.id}
                    variant={button.variant || 'default'}
                    onClick={button.onClick}
                  >
                    {button.icon}
                    {button.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      case 'yearSelector':
        return (
          <YearSelectorHeader
            title={props.headerProps.title}
            subtitle={props.headerProps.subtitle}
            currentYear={props.headerProps.currentYear}
            years={props.headerProps.years}
            onYearChange={props.headerProps.onYearChange}
            actionButtons={props.headerProps.actionButtons}
            className={props.headerProps.className}
          />
        );
      case 'studentApplication':
        return (
          <StudentApplicationHeader
            studentName={props.headerProps.studentName}
            program={props.headerProps.program}
            status={props.headerProps.status}
            avatarUrl={props.headerProps.avatarUrl}
            tags={props.headerProps.tags}
            actionButtons={props.headerProps.actionButtons}
            className={props.headerProps.className}
            isLoading={props.headerProps.isLoading}
          />
        );
      case 'custom':
        return props.headerInfo;
      default:
        return rightSidebarContent;
    }
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'inbox':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Inbox</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">JD</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500 truncate">Project update: Phase 2 completed successfully</p>
                </div>
                <span className="text-xs text-gray-400">2m ago</span>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">AS</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Alice Smith</p>
                  <p className="text-sm text-gray-500 truncate">Meeting notes from today's sync</p>
                </div>
                <span className="text-xs text-gray-400">1h ago</span>
              </div>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">New Task Assigned</p>
                  <p className="text-sm text-gray-500">You have been assigned to the "Dashboard Redesign" project</p>
                </div>
                <span className="text-xs text-gray-400">5m ago</span>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Project Milestone</p>
                  <p className="text-sm text-gray-500">Phase 1 of the project has been completed</p>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
              </div>
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Calendar</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Today</span>
                  <span className="text-xs text-gray-500">3 events</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 rounded bg-blue-50">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-600">10:00 AM - Team Standup</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded bg-green-50">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span className="text-sm text-gray-600">2:00 PM - Project Review</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded bg-purple-50">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    <span className="text-sm text-gray-600">4:00 PM - Client Meeting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'announcements':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Announcements</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">System Maintenance</h4>
                    <p className="text-sm text-gray-500 mt-1">Scheduled maintenance will occur this weekend. Please save your work.</p>
                    <span className="text-xs text-gray-400 mt-2 block">Posted 1d ago</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">New Feature Release</h4>
                    <p className="text-sm text-gray-500 mt-1">Version 2.0 of our platform is now live with exciting new features.</p>
                    <span className="text-xs text-gray-400 mt-2 block">Posted 2d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return rightSidebarContent
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Sidebar */}
      {leftSidebarContent ? (
        leftSidebarContent
      ) : (
        <LeftSidebar
          logo={logo}
          className="relative z-20"
          navigationType={navigationType}
          activeRoute={activeRoute}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header 
          className="h-[98px] border-b flex-shrink-0 bg-white/80 backdrop-blur-[15px] elevation-3 relative z-20"
          role="banner"
        >
          <div className="h-full flex">
            {/* Header info area */}
            <div className="flex-1 px-6 flex items-center">
              {renderHeader()}
            </div>
            {/* Header user area */}
            <div className="w-[320px] border-l px-6 flex items-center">
              {headerUserArea || <HeaderUserArea />}
            </div>
          </div>
        </header>

        {/* Content area with right sidebar */}
        <div className="flex-1 flex overflow-hidden -mt-[98px]">
          {/* Main scrollable content */}
          <main 
            className={cn(
              "flex-1 overflow-y-auto p-6 bg-[var(--theme-color-grey-25)] relative z-10 pt-[122px]",
              className
            )}
            role="main"
          >
            {children}
          </main>

          {/* Right sidebar */}
          <RightSidebar
            isOpen={isOpen}
            onToggle={handleRightSidebarToggle}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="mt-[98px] relative z-20"
          />
        </div>
      </div>
    </div>
  )
} 