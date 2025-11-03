'use client'

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@repo/ui/lib/utils'
import { Button } from '@repo/ui/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@repo/ui/components/ui/dropdown-menu'
import { ChevronDown, Home, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface StudentApplicationSidebarProps {
  /** Logo component to be displayed in the sidebar */
  logo?: ReactNode
  /** Navigation items for the dropdown menu */
  dropdownItems: Array<{ href: string; label: string }>
  /** Currently active route */
  activeRoute?: string
  /** Additional className for the sidebar */
  className?: string
  /** Student name for context */
  studentName?: string
  /** Application sections with completion status */
  applicationSections?: Array<{ 
    id: string; 
    label: string; 
    completed?: boolean;
    active?: boolean;
    href?: string;
    completionPercentage?: number;
    subSections?: Array<{
      id: string;
      label: string;
      completionPercentage: number;
      active?: boolean;
      href?: string;
    }>;
  }>
  /** Whether to show skeleton loading state */
  isLoading?: boolean
}

// Default application sections
const defaultApplicationSections = [
  { 
    id: 'partner-assessment', 
    label: 'Partner Assessment', 
    completed: true,
    active: true,
    completionPercentage: 85,
    subSections: [
      {
        id: 'interview-details',
        label: 'Interview Details',
        completionPercentage: 100,
        active: true,
        href: '#interview-details'
      },
      {
        id: 'special-requests',
        label: 'Special Requests',
        completionPercentage: 30,
        active: false,
        href: '#special-requests'
      },
      {
        id: 'direct-placement',
        label: 'Direct Placement',
        completionPercentage: 60,
        active: false,
        href: '#direct-placement'
      },
      {
        id: 'student-evaluation',
        label: 'Student Evaluation',
        completionPercentage: 0,
        active: false,
        href: '#student-evaluation'
      },
      {
        id: 'english-comprehension',
        label: 'English Comprehension Score',
        completionPercentage: 0,
        active: false,
        href: '#english-comprehension'
      }
    ]
  },
  { 
    id: 'student-details', 
    label: 'Student Details', 
    completed: true,
    active: false 
  },
  { 
    id: 'family', 
    label: 'Family', 
    completed: true,
    active: false 
  },
  { 
    id: 'biography', 
    label: 'Biography', 
    completed: true,
    active: false 
  },
  { 
    id: 'school-languages', 
    label: 'School & Languages', 
    completed: true,
    active: false 
  },
  { 
    id: 'housing-food-allergies', 
    label: 'Housing, Food, Allergies & Pets', 
    completed: true,
    active: false 
  },
  { 
    id: 'dear-family-letter', 
    label: 'Dear Family Letter', 
    completed: true,
    active: false 
  },
  { 
    id: 'photos', 
    label: 'Photos', 
    completed: true,
    active: false 
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    completed: true,
    active: false 
  },
  { 
    id: 'agreements', 
    label: 'Agreements', 
    completed: true,
    active: false 
  },
  { 
    id: 'vaccinations', 
    label: 'Vaccinations', 
    completed: true,
    active: false 
  }
]

// Fixed widths array to prevent hydration mismatch
const SKELETON_WIDTHS = ['60%', '75%', '65%', '80%', '70%', '85%', '55%', '90%'];

/**
 * StudentApplicationSidebar component that provides specialized navigation for student application pages
 */
export function StudentApplicationSidebar({
  logo,
  dropdownItems = [],
  activeRoute = '/',
  className,
  studentName,
  applicationSections = defaultApplicationSections,
  isLoading = false,
}: StudentApplicationSidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeSubsectionId, setActiveSubsectionId] = useState<string>('interview-details')

  // Add click listeners to form sections to update active state
  useEffect(() => {
    // Dynamically build section mapping from applicationSections data
    const sectionMapping: Record<string, string> = {};
    
    applicationSections.forEach(section => {
      if (section.active && section.subSections) {
        section.subSections.forEach(subSection => {
          if (subSection.href) {
            // Extract ID from href (remove #)
            const sectionId = subSection.href.replace('#', '');
            sectionMapping[sectionId] = subSection.id;
          }
        });
      }
    });

    const handleSectionClick = (event: Event) => {
      const target = event.target as HTMLElement;
      // Find the closest section element
      const sectionElement = target.closest('[id]') as HTMLElement;
      if (sectionElement && sectionElement.id) {
        const mappedSubsectionId = sectionMapping[sectionElement.id];
        if (mappedSubsectionId) {
          setActiveSubsectionId(mappedSubsectionId);
        }
      }
    };

    // Add event listeners to all sections
    Object.keys(sectionMapping).forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.addEventListener('click', handleSectionClick);
      }
    });

    // Cleanup event listeners
    return () => {
      Object.keys(sectionMapping).forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.removeEventListener('click', handleSectionClick);
        }
      });
    };
  }, [applicationSections]);

  return (
    <aside 
      className={cn(
        "w-[320px] flex-shrink-0 flex flex-col border-r bg-white elevation-3 relative z-20",
        className
      )}
      role="complementary"
      aria-label="Student application sidebar"
    >
      {/* Logo area */}
      <div className="h-[98px] flex items-center justify-center px-4">
        {logo}
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">
        {/* Home Menu Dropdown */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="tertiary" 
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  disabled={isLoading}
                >
                  <Home className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-[288px] max-h-[400px] overflow-y-auto"
                sideOffset={8}
              >
                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      href={item.href}
                      className="w-full cursor-pointer"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isLoading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            ) : (
              <span className="text-base font-medium text-[var(--color-text-default)]">
                Home Menu
              </span>
            )}
          </div>
        </div>

        {/* Application Sections */}
        <div className="px-4">
          <nav className="flex flex-col -mx-4 relative">
            {isLoading ? (
              // Skeleton loading state for application sections
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-full px-4 py-3 text-base font-medium transition-colors relative bg-white",
                      "border-t border-[var(--theme-color-primary-300)]",
                      "text-center",
                      index === 7 && "border-b border-b-[var(--theme-color-primary-300)]"
                    )}
                  >
                    <div 
                      className="h-4 bg-gray-200 rounded animate-pulse mx-auto" 
                      style={{ width: SKELETON_WIDTHS[index] }} 
                    />
                  </div>
                ))}
              </>
            ) : (
              applicationSections.map((section, index) => (
                <div key={section.id}>
                  <div
                    className={cn(
                      "w-full px-4 py-3 text-base font-medium transition-colors relative bg-white",
                      "border-t border-[var(--theme-color-primary-300)]",
                      "text-[var(--theme-color-primary-700)]",
                      "text-center",
                      "cursor-pointer",
                      index === applicationSections.length - 1 && !section.active && "border-b border-b-[var(--theme-color-primary-300)]",
                      // Active sections get bold font
                      section.active && "font-semibold border-b border-b-[var(--theme-color-primary-300)]",
                      // Hover effects only for non-active sections
                      !section.active && "hover:bg-[var(--button-ghost-hover-bg)] hover:text-[var(--theme-color-primary-800)]"
                    )}
                    style={{
                      // Active sections get inset border effect
                      ...(section.active && {
                        boxShadow: 'inset 8px 0 0 var(--theme-color-primary-300), inset -8px 0 0 var(--theme-color-primary-300)'
                      })
                    }}
                  >
                    {/* Check mark icon for completed sections */}
                    {section.completed && (
                      <CheckCircle 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 size-4 text-[var(--theme-color-primary-600)]" 
                        strokeWidth={2}
                      />
                    )}
                    {section.label}
                  </div>

                  {/* Subsections - only show when parent section is active */}
                  {section.active && section.subSections && (
                    <div 
                      className="pl-3 pr-5 py-5 border-b border-b-[var(--theme-color-primary-300)] bg-var(--theme-color-grey-25) shadow-inner"
                    >
                      <div className="relative">
                        {/* Vertical timeline bar */}
                        <div 
                          className="absolute left-[7px] top-[-10px] bottom-[-10px] w-0.75 rounded-full"
                          style={{ backgroundColor: 'var(--theme-color-grey-200)' }}
                        />
                        
                        {/* Subsection items */}
                        {section.subSections.map((subSection, subIndex) => {
                          const isComplete = subSection.completionPercentage === 100;
                          const isInProgress = subSection.completionPercentage > 0 && subSection.completionPercentage < 100;
                          const isNotStarted = subSection.completionPercentage === 0;
                          const isActive = activeSubsectionId === subSection.id;
                          
                          return (
                            <div
                              key={subSection.id}
                                                             className={cn(
                                 "relative flex items-start gap-3 cursor-pointer transition-colors",
                                 subIndex !== (section.subSections?.length ?? 0) - 1 && "mb-4"
                               )}
                              onClick={() => {
                                // Update active subsection
                                setActiveSubsectionId(subSection.id);
                                
                                if (subSection.href) {
                                  const element = document.querySelector(subSection.href) as HTMLElement;
                                  if (element) {
                                    // Add temporary negative margin to offset the scroll
                                    const originalStyle = element.style.cssText;
                                    element.style.scrollMarginTop = '140px';
                                    
                                    // Use scrollIntoView with the margin
                                    element.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'start' 
                                    });
                                    
                                    // Clean up after scroll
                                    setTimeout(() => {
                                      element.style.cssText = originalStyle;
                                    }, 1000);
                                  }
                                }
                              }}
                            >
                                                              {/* Timeline dot */}
                                <div className="relative z-10 flex-shrink-0 mt-[3px]">
                                  {isComplete ? (
                                    <div className="relative">
                                      {/* Background circle for complete state */}
                                      <div 
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          backgroundColor: 'var(--theme-color-grey-25)',
                                          top: '-2px',
                                          left: '-2px'
                                        }}
                                      />
                                      <CheckCircle 
                                        className="size-4 relative z-10" 
                                        strokeWidth={2}
                                        style={{ color: 'var(--theme-color-primary-600)' }}
                                      />
                                    </div>
                                  ) : (
                                  <div
                                    className="w-[13px] h-[13px] rounded-full border-[2.5px] ml-0.5"
                                    style={{
                                      backgroundColor: isActive ? 'var(--theme-color-primary-600)' : 'white',
                                      borderColor: isActive ? 'var(--theme-color-primary-600)' : 'var(--theme-color-grey-300)'
                                    }}
                                  />
                                )}
                              </div>

                              {/* Subsection content */}
                              <div className="flex-1 min-w-0">
                                {/* Subsection label */}
                                <div className="text-sm font-medium text-[var(--color-text-default)] mb-1">
                                  {subSection.label}
                                </div>

                                                                 {/* Progress bar */}
                                 <div className="relative w-full" style={{ height: '4px' }}>
                                   {/* Background bar */}
                                   <div
                                     className="absolute inset-0 rounded-full transition-all"
                                     style={{
                                       backgroundColor: isNotStarted  && !isActive ? 'var(--theme-color-grey-100)' : 
                                                      isNotStarted ? 'white' : 
                                                      isInProgress && !isActive ? 'white' :
                                                      isComplete ? 'var(--theme-color-primary-500)' :
                                                      isActive && isInProgress ? 'white' : 'var(--theme-gray-400)',
                                       border: isActive && isInProgress ? '1px solid white' : 'none',
                                       boxShadow: isActive ? '0px 1px 2px 0px var(--primary-shadow-color-1), 0px 0px 0px 4px var(--primary-shadow-color-2)' : 'none'
                                     }}
                                   />
                                   {/* Progress fill for in-progress states */}
                                   {isInProgress && (
                                     <div
                                       className="absolute top-0 left-0 rounded-full transition-all"
                                       style={{
                                         width: `${subSection.completionPercentage}%`,
                                         height: '4px',
                                         backgroundColor: 'var(--theme-color-primary-500)'
                                       }}
                                     />
                                   )}
                                 </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>
      </div>
    </aside>
  )
} 