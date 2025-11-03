import { ReactNode } from 'react'
import { cn } from '@repo/ui/lib/utils'
import { LeftNavLink } from '../navigation/LeftNavLink'
import { HydrationSafeText } from '../ui/hydration-safe-text'

// Define navigation types
export type NavigationType = 'student' | 'sevis' | 'host' | 'coordinator' | 'partner'

// Define navigation items for each type
export const navigationItemsByType: Record<NavigationType, Array<{ href: string; label: string }>> = {
  student: [
    { href: '/', label: 'Home' },
    { href: '/application', label: 'Application' },
    { href: '/resources', label: 'Resources' },
  ],
  sevis: [
    { href: '/sevis-user', label: 'Home' },
    { href: '/sevis-user/students', label: 'Students' },
    { href: '/sevis-user/host-families', label: 'Host Families' },
    { href: '/sevis-user/local-coordinators', label: 'Local Coordinators' },
    { href: '/sevis-user/placements', label: 'Placements' },
    { href: '/sevis-user/change-queue', label: 'Change Queue' },
    { href: '/sevis-user/sevis', label: 'SEVIS' },
  ],
  host: [
    { href: '/', label: 'Home' },
    { href: '/students', label: 'Students' },
    { href: '/resources', label: 'Resources' },
  ],
  coordinator: [
    { href: '/', label: 'Home' },
    { href: '/students', label: 'Students' },
    { href: '/host-families', label: 'Host Families' },
    { href: '/placements', label: 'Placements' },
  ],
  partner: [
    { href: '/', label: 'Home' },
    { href: '/students', label: 'Students' },
    { href: '/on-program', label: 'On Program' },
    { href: '/resources', label: 'Resources' },
  ],
}

// Fixed widths array to prevent hydration mismatch
const SKELETON_WIDTHS = ['65%', '80%', '70%', '90%', '75%', '60%'];

interface LeftSidebarProps {
  /** Logo component to be displayed in the sidebar */
  logo?: ReactNode
  /** Currently active route */
  activeRoute?: string
  /** Type of navigation to display */
  navigationType: NavigationType
  /** Additional className for the sidebar */
  className?: string
  /** Whether to show skeleton loading state */
  isLoading?: boolean
}

/**
 * LeftSidebar component that provides a consistent sidebar layout for different pages
 */
export function LeftSidebar({
  logo,
  activeRoute = '/',
  navigationType,
  className,
  isLoading = false,
}: LeftSidebarProps) {
  const navigationItems = navigationItemsByType[navigationType]

  return (
    <aside 
      className={cn(
        "w-[320px] flex-shrink-0 flex flex-col border-r bg-white elevation-3 relative z-20",
        className
      )}
      role="complementary"
      aria-label="Left sidebar"
    >
      {/* Logo area */}
      <div className="h-[98px] flex items-center justify-center px-4">
        {logo}
      </div>
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto px-4">
        <nav className="flex flex-col -mx-4 relative">
          {isLoading ? (
            // Skeleton loading state for navigation items
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full px-4 py-3 text-base font-medium transition-colors relative bg-white"
                >
                  <div 
                    className="h-4 bg-gray-200 rounded animate-pulse" 
                    style={{ width: SKELETON_WIDTHS[index] }} 
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {navigationItems.map((item, index) => (
                <LeftNavLink
                  key={item.href}
                  href={item.href}
                  isActive={activeRoute === item.href}
                  isLastItem={index === navigationItems.length - 1}
                >
                  {item.label}
                </LeftNavLink>
              ))}
              {/* Notification dot overlays */}
              {(() => {
                const indicatorLabels = ['Change Queue'];
                const visibleIndicators = indicatorLabels.filter(label => 
                  navigationItems.some(item => item.label === label)
                );
                
                return visibleIndicators.map((targetLabel, visibleIndex) => {
                  const itemIndex = navigationItems.findIndex(item => item.label === targetLabel);
                  const staggerDelay = visibleIndex * 0.3; // 300ms stagger based on visible indicator position
                  return itemIndex !== -1 ? (
                    <HydrationSafeText 
                      key={targetLabel}
                      as="div"
                      className="absolute pointer-events-none"
                      style={{
                        top: `${itemIndex * 100 / navigationItems.length}%`,
                        transform: `translateY(calc(${100 / navigationItems.length / 2}% + 1.5rem - 50%))`,
                        left: '24px',
                      }}
                    >
                      {/* Core dot */}
                      <div 
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: 'var(--theme-color-primary-600)',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                      {/* Sonar rings */}
                      <div 
                        className="absolute w-2 h-2 rounded-full border-2 opacity-0"
                        style={{
                          borderColor: 'var(--theme-color-primary-300)',
                          transform: 'translate(-50%, -50%)',
                          animation: 'sonar-ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
                          animationDelay: `${staggerDelay}s`,
                        }}
                      />
                      <div 
                        className="absolute w-2 h-2 rounded-full border-2 opacity-0"
                        style={{
                          borderColor: 'var(--theme-color-primary-300)',
                          transform: 'translate(-50%, -50%)',
                          animation: 'sonar-ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
                          animationDelay: `${2 + staggerDelay}s`,
                        }}
                      />
                    </HydrationSafeText>
                  ) : null;
                });
              })()}
            </>
          )}
          
          {/* Sonar animation keyframes */}
          <style>{`
            @keyframes sonar-ping {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              75%, 100% {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
              }
            }
          `}</style>
        </nav>
      </div>
    </aside>
  )
} 