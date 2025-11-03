/**
 * RightSidebar Component
 * 
 * A collapsible sidebar that displays different sections (inbox, notifications, calendar, announcements).
 * 
 * Functionality:
 * 1. When Sidebar is Open:
 *    - Clicking any section icon (inbox, notifications, calendar, announcements) shows that section's content
 *    - The clicked icon shows as active with the blue border and color
 * 
 * 2. When Sidebar is Closed:
 *    - Clicking the arrow icon opens the sidebar and restores the section that was active before closing
 *    - Clicking any section icon opens the sidebar and shows that section's content
 *    - The clicked icon becomes active
 * 
 * 3. State Management:
 *    - lastActiveTab: stores the active section when sidebar is closed
 *    - activeTab: controls which section is currently displayed
 *    - isOpen: controls sidebar visibility
 * 
 * Props:
 * @param isOpen - boolean - Controls sidebar visibility
 * @param onToggle - () => void - Callback for toggling sidebar
 * @param activeTab - string - Currently active section
 * @param onTabChange - (tab: string) => void - Callback for changing active section
 * @param className - string (optional) - Additional CSS classes
 */

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@repo/ui/lib/utils'
import { 
  ChevronsRight, 
  Bell, 
  Inbox, 
  Calendar, 
  Megaphone, 
  FileText, 
  AlertCircle, 
  UserCheck, 
  Loader2 
} from 'lucide-react'
import { Separator } from '@repo/ui/components/ui'

interface RightSidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

interface NotificationType {
  id: string
  icon: ReactNode
  title: string
  description: string
  timestamp: string
  isUnread: boolean
}

const ITEMS_PER_PAGE = 5

export function RightSidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  className
}: RightSidebarProps) {
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [lastActiveTab, setLastActiveTab] = useState(activeTab)

  const handleTabClick = (tab: string) => {
    if (!isOpen) {
      onTabChange(tab)
      onToggle()
    } else {
      onTabChange(tab)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      onTabChange(lastActiveTab)
    } else {
      setLastActiveTab(activeTab)
    }
    onToggle()
  }

  const notifications: NotificationType[] = [
    {
      id: '1',
      icon: <Bell className="w-4 h-4" />,
      title: 'Urgent: Student visa status requires immediate attention',
      description: 'SEVIS record for John Smith (N0012345678) will terminate in 5 days due to program end date',
      timestamp: '2 hours ago',
      isUnread: true
    },
    {
      id: '2',
      icon: <Calendar className="w-4 h-4" />,
      title: 'OPT Application Deadline',
      description: '5 students have pending OPT applications that need to be reviewed within 48 hours',
      timestamp: '4 hours ago',
      isUnread: true
    },
    {
      id: '3',
      icon: <Inbox className="w-4 h-4" />,
      title: 'I-20 Documents Updated',
      description: '3 new I-20 documents have been processed and are ready for review',
      timestamp: 'Yesterday at 3:45 PM',
      isUnread: false
    },
    {
      id: '4',
      icon: <Megaphone className="w-4 h-4" />,
      title: 'SEVIS System Update',
      description: 'Scheduled maintenance on July 15th. The system will be unavailable from 2 AM to 6 AM EST.',
      timestamp: '2 days ago',
      isUnread: false
    },
    {
      id: '5',
      icon: <FileText className="w-4 h-4" />,
      title: 'CPT Authorization Request',
      description: 'New CPT request from Sarah Johnson (N0023456789) needs your approval',
      timestamp: '2 days ago',
      isUnread: true
    },
    {
      id: '6',
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Address Update Required',
      description: '8 students have not updated their local addresses within the required timeframe',
      timestamp: '3 days ago',
      isUnread: true
    },
    {
      id: '7',
      icon: <UserCheck className="w-4 h-4" />,
      title: 'Program Extension Approved',
      description: 'Program extension for Michael Chen (N0034567890) has been approved',
      timestamp: '4 days ago',
      isUnread: false
    },
    {
      id: '8',
      icon: <Bell className="w-4 h-4" />,
      title: 'Enrollment Warning',
      description: '3 students are at risk of falling below full-time enrollment status',
      timestamp: '5 days ago',
      isUnread: true
    }
  ]

  const handleLoadMore = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setPage(prev => prev + 1)
    setIsLoading(false)
  }

  const displayedNotifications = notifications.slice(0, page * ITEMS_PER_PAGE)
  const hasMore = displayedNotifications.length < notifications.length

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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Your notifications</h3>
              <button className="text-sm font-medium flex items-center gap-1 text-[var(--button-tertiary-text)] hover:text-[var(--button-tertiary-hover-text)]">
                <span>Mark all as read</span>
              </button>
            </div>

            <div className="space-y-4">
              {displayedNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className="flex items-start gap-3 group cursor-pointer">
                    <div className="relative mt-0.5">
                      <div className="text-[var(--text-tertiary)]">
                        {notification.icon}
                      </div>
                      {notification.isUnread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--button-default-bg)] absolute -right-0.5 -top-0.5 ring-1 ring-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-primary)]">
                        <span className="font-medium">{notification.title}</span>
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {notification.description}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-2">{notification.timestamp}</p>
                    </div>
                  </div>
                  {index < displayedNotifications.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}

              {hasMore && (
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full py-3 text-sm font-medium border-t flex items-center justify-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-tertiary-hover)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] disabled:opacity-50 transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </button>
              )}
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">Calendar</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Today</span>
                  <span className="text-xs text-[var(--text-tertiary)]">3 events</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 rounded bg-[var(--button-tertiary-hover-bg)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--button-default-bg)]"></div>
                    <span className="text-sm text-[var(--text-secondary)]">10:00 AM - Team Standup</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded bg-[var(--button-tertiary-hover-bg)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--button-default-bg)]"></div>
                    <span className="text-sm text-[var(--text-secondary)]">2:00 PM - Project Review</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded bg-[var(--button-tertiary-hover-bg)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--button-default-bg)]"></div>
                    <span className="text-sm text-[var(--text-secondary)]">4:00 PM - Client Meeting</span>
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
        return null
    }
  }

  return (
    <aside 
      className={cn(
        "transition-all duration-300 ease-in-out bg-white flex elevation-3 relative z-20",
        isOpen ? "w-[320px]" : "w-[52px]",
        className
      )}
      role="complementary"
      aria-label="Right sidebar"
    >
      {/* Button strip - always visible */}
      <div className="w-[52px] border-l flex flex-col bg-white relative z-30">
        <button
          onClick={handleToggle}
          className="w-[52px] h-[52px] border-b flex items-center justify-center text-[var(--button-tertiary-text)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] transition-colors duration-200"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
        >
          <div className="w-8 h-8 rounded-lg border border-[var(--button-tertiary-border)] flex items-center justify-center">
            <ChevronsRight
              className={cn("w-5 h-5 transition-transform", 
                isOpen ? "rotate-0" : "rotate-180"
              )}
            />
          </div>
        </button>
        <button 
          onClick={() => handleTabClick('inbox')}
          className={cn(
            "w-[52px] h-[52px] border-b flex items-center justify-center transition-all duration-200 relative",
            activeTab === 'inbox' 
              ? "bg-white text-[var(--theme-color-primary-700)]" 
              : "text-[var(--button-tertiary-text)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] border-r"
          )}
          aria-label="Inbox"
          aria-pressed={activeTab === 'inbox'}
        >
          {activeTab === 'inbox' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-color-primary-300)]" />
          )}
          <Inbox className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleTabClick('notifications')}
          className={cn(
            "w-[52px] h-[52px] border-b flex items-center justify-center transition-all duration-200 relative",
            activeTab === 'notifications'
              ? "bg-white text-[var(--theme-color-primary-700)]"
              : "text-[var(--button-tertiary-text)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] border-r"
          )}
          aria-label="Notifications"
          aria-pressed={activeTab === 'notifications'}
        >
          {activeTab === 'notifications' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-color-primary-300)]" />
          )}
          <Bell className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleTabClick('calendar')}
          className={cn(
            "w-[52px] h-[52px] border-b flex items-center justify-center transition-all duration-200 relative",
            activeTab === 'calendar'
              ? "bg-white text-[var(--theme-color-primary-700)]"
              : "text-[var(--button-tertiary-text)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] border-r"
          )}
          aria-label="Calendar"
          aria-pressed={activeTab === 'calendar'}
        >
          {activeTab === 'calendar' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-color-primary-300)]" />
          )}
          <Calendar className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleTabClick('announcements')}
          className={cn(
            "w-[52px] h-[52px] border-b flex items-center justify-center transition-all duration-200 relative",
            activeTab === 'announcements'
              ? "bg-white text-[var(--theme-color-primary-700)]"
              : "text-[var(--button-tertiary-text)] hover:bg-[var(--button-tertiary-hover-bg)] active:bg-[var(--button-tertiary-active-bg)] border-r"
          )}
          aria-label="Announcements"
          aria-pressed={activeTab === 'announcements'}
        >
          {activeTab === 'announcements' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-color-primary-300)]" />
          )}
          <Megaphone className="w-6 h-6" />
        </button>
      </div>

      {/* Main sidebar content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out border-l",
        isOpen ? "opacity-100 w-[268px]" : "opacity-0 w-0 overflow-hidden"
      )}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {isOpen && renderSidebarContent()}
          </div>
        </div>
      </div>
    </aside>
  )
} 