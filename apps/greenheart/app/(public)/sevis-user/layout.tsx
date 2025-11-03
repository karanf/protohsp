'use client'

import { PageLayout } from "@repo/ui/components/templates/PageLayout"
import { StudentApplicationSidebar } from "@repo/ui/components/templates/StudentApplicationSidebar"
import { navigationItemsByType } from "@repo/ui/components/templates/LeftSidebar"
import { Download, PlusCircle, ChevronsRight, Inbox, ChevronDown, LogOut, Settings, User, Bell } from "lucide-react"
import { useState } from "react"
import { cn } from "@repo/ui/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@repo/ui/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@repo/ui/components/ui/dropdown-menu"
import { useInstantData } from '@/lib/useInstantData'

export default function SEVISLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [selectedYear, setSelectedYear] = useState("2025-2026")
  const years = [
    "2020-2021", 
    "2021-2022", 
    "2022-2023", 
    "2023-2024", 
    "2024-2025", 
    "2025-2026", 
    "2026-2027"
  ]
  const pathname = usePathname()
  const router = useRouter()
  
  // Get student data for student application pages
  const { users, profiles, error, isLoading: hookIsLoading } = useInstantData()
  
  // Check if we're on a student application page
  const isStudentApplicationPage = pathname?.includes('/student-application/')
  const studentId = isStudentApplicationPage ? pathname?.split('/student-application/')[1] : null
  
  // Get student data if on student application page
  const student = studentId ? users.find(user => user.id === studentId && user.role === 'student') : null
  const studentProfile = studentId ? profiles.find(p => p.userId === studentId) : null
  
  // Show loading state initially or when hook is loading or when no student data yet
  const isLoadingStudentData = isStudentApplicationPage && (!student || hookIsLoading)
  
  // Get the current view title
  const getPageTitle = () => {
    const segment = pathname?.split('/').pop() || ''
    switch (segment) {
      case 'host-families':
        return 'Host Families'
      case 'local-coordinators':
        return 'Local Coordinators'
      case 'placements':
        return 'Placements'
      case 'change-queue':
        return 'Change Queue'
      case 'students':
        return 'Students'
      case 'sevis':
        return 'SEVIS'
      default:
        return 'Dashboard'
    }
  }

  // Render different layouts based on page type - switch immediately for student application pages
  if (isStudentApplicationPage) {
    // Student application page - use studentApplication header (with loading state if needed)
    const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unknown Student' : 'Loading...'
    const program = studentProfile?.data?.program || 'Unknown Program'
    const status = studentProfile?.data?.applicationStatus || 'pending'
    
    return (
      <PageLayout
        headerType="studentApplication"
        headerProps={{
          studentName,
          program: typeof program === 'string' ? program : 'Educatius USA Select 2025-2026',
          status,
          avatarUrl: student?.avatarUrl,
          tags: [
            { id: "program", label: "Educatius USA Select 2025-2026" }
          ],
          actionButtons: [
            {
              id: "save-draft",
              label: "Save Draft",
              variant: "outline" as const,
              onClick: () => {}
            },
            {
              id: "save-changes",
              label: "Save Changes",
              variant: "default" as const,
              onClick: () => {}
            }
          ],
          isLoading: isLoadingStudentData
        }}
        leftSidebarContent={
          <StudentApplicationSidebar
            logo={
              <div className="h-[50px] flex items-center justify-center">
                <img
                  src="/assets/logo.svg"
                  alt="Greenheart Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
            }
            dropdownItems={navigationItemsByType['sevis']}
            activeRoute={pathname || '/sevis-user'}
            studentName={studentName}
            isLoading={isLoadingStudentData}
          />
        }
        headerUserArea={
          <div className="flex items-center gap-4 w-full">
            <div 
              className="flex w-[3.125rem] h-[3.125rem] items-start gap-[0.625rem] flex-shrink-0 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] overflow-hidden"
            >
              {isLoadingStudentData ? (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              ) : (
                <img 
                  src="https://api.dicebear.com/9.x/open-peeps/svg?seed=gerald_thomson_gerald-thomson&backgroundColor=fffaf0&size=200&head=noHair2&face=old&accessories=glasses2&facialHair=full" 
                  alt="Gerald Thomson" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="flex-1">
              {isLoadingStudentData ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              ) : (
                <span className="font-medium text-gray-700">Gerald Thomson</span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="tertiary" size="icon">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600" 
                  onClick={() => router.push('/')}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        isRightSidebarOpen={isRightSidebarOpen}
        onRightSidebarToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        rightSidebarContent={
          <div className="h-full flex flex-col">
            <div className="w-[52px] border-l border-r flex flex-col absolute left-0 top-0">
              <button
                className="w-[52px] h-[52px] border-b flex items-center justify-center"
              >
                <ChevronsRight 
                  className={cn("w-6 h-6 transition-transform", 
                    isRightSidebarOpen ? "rotate-0" : "rotate-180"
                  )}
                />
              </button>
              <button className="w-[52px] h-[52px] border-b flex items-center justify-center">
                <Inbox className="h-6 w-6" />
              </button>
            </div>
            <div className={cn(
              "flex-1 transition-all duration-300 ease-in-out overflow-hidden",
              isRightSidebarOpen ? "opacity-100 w-[268px]" : "opacity-0 w-0"
            )}>
              <div className="py-4 px-3 space-y-4 w-full max-w-[268px]">
                {/* Right sidebar content */}
                <div className="space-y-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">Document approved</p>
                        <p className="text-gray-500">2 hours ago</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {children}
      </PageLayout>
    )
  }

  // Regular dashboard pages - use year selector header
  return (
    <PageLayout
      headerType="yearSelector"
      headerProps={{
        title: getPageTitle(),
        currentYear: selectedYear,
        years: years,
        onYearChange: setSelectedYear,
        actionButtons: []
      }}
      logo={
        <div className="h-[50px] flex items-center justify-center">
          <img
            src="/assets/logo.svg"
            alt="Greenheart Logo"
            className="h-full w-auto object-contain"
          />
        </div>
      }
      navigationType="sevis"
      activeRoute={pathname || '/sevis-user'}
      headerUserArea={
        <div className="flex items-center gap-4 w-full">
          <div 
            className="flex w-[3.125rem] h-[3.125rem] items-start gap-[0.625rem] flex-shrink-0 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] overflow-hidden"
          >
            <img 
              src="https://api.dicebear.com/9.x/open-peeps/svg?seed=gerald_thomson_gerald-thomson&backgroundColor=fffaf0&size=200&head=noHair2&face=old&accessories=glasses2&facialHair=full" 
              alt="Gerald Thomson" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <span className="font-medium text-gray-700">Gerald Thomson</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="tertiary" size="icon">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600" 
                onClick={() => router.push('/')}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      isRightSidebarOpen={isRightSidebarOpen}
      onRightSidebarToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      rightSidebarContent={
        <div className="h-full flex flex-col">
          <div className="w-[52px] border-l border-r flex flex-col absolute left-0 top-0">
            <button
              className="w-[52px] h-[52px] border-b flex items-center justify-center"
            >
              <ChevronsRight 
                className={cn("w-6 h-6 transition-transform", 
                  isRightSidebarOpen ? "rotate-0" : "rotate-180"
                )}
              />
            </button>
            <button className="w-[52px] h-[52px] border-b flex items-center justify-center">
              <Inbox className="h-6 w-6" />
            </button>
          </div>
          <div className={cn(
            "flex-1 transition-all duration-300 ease-in-out overflow-hidden",
            isRightSidebarOpen ? "opacity-100 w-[268px]" : "opacity-0 w-0"
          )}>
            <div className="py-4 px-3 space-y-4 w-full max-w-[268px]">
              {/* Right sidebar content */}
              <div className="space-y-4">
                <h3 className="font-medium">Recent Activity</h3>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">Document approved</p>
                      <p className="text-gray-500">2 hours ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </PageLayout>
  )
} 