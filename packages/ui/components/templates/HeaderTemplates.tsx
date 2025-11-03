import { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Typography } from '../ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BaseHeaderProps {
  className?: string
  /** Whether to show skeleton loading state */
  isLoading?: boolean
}

// Simple greeting header (e.g., "Hi David & Melissa")
interface GreetingHeaderProps extends BaseHeaderProps {
  greeting: string
  names: string
}

export function GreetingHeader({ greeting, names, className, isLoading = false }: GreetingHeaderProps) {
  return (
    <div className={cn("flex items-center h-full", className)}>
      {isLoading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
      ) : (
        <Typography variant="h2" className="text-2xl">
          {greeting} {names}
        </Typography>
      )}
    </div>
  )
}

// Profile header with badges/tags (e.g., "Bessie Cooper" with tags)
interface ProfileHeaderProps extends BaseHeaderProps {
  name: string
  tags?: Array<{
    id: string
    label: string
  }>
  status?: {
    label: string
    type?: 'default' | 'secondary' | 'destructive'
  }
  actions?: ReactNode
}

export function ProfileHeader({ name, tags = [], status, actions, className, isLoading = false }: ProfileHeaderProps) {
  return (
    <div className={cn("flex flex-col justify-center h-full", className)}>
      {isLoading ? (
        <>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-2" />
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
          </div>
        </>
      ) : (
        <>
          <Typography variant="h2" className="text-xl mb-2">{name}</Typography>
          <div className="flex items-center gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.label}
              </Badge>
            ))}
            {status && (
              <Badge 
                variant={status.type || 'default'}
                className="ml-2"
              >
                Status: {status.label}
              </Badge>
            )}
          </div>
        </>
      )}
      {actions && !isLoading && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Profile header with action buttons (e.g., "David Jenkins & Melissa Seymour" with action buttons)
interface ActionHeaderProps extends BaseHeaderProps {
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
    variant?: 'default' | 'secondary' | 'destructive' | 'tertiary' | 'outline' | 'ghost' | 'link'
  }>
}

export function ActionHeader({ 
  title, 
  subtitle,
  tags = [], 
  status,
  navigationControls = false,
  actionButtons = [],
  className,
  isLoading = false
}: ActionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full h-full", className)}>
      <div className="flex items-center gap-4">
        {navigationControls && !isLoading && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight size={24} />
            </Button>
          </div>
        )}
        <div className="flex flex-col">
          {isLoading ? (
            <>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-1" />
              {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2" />}
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Typography variant="h2" className="text-xl">{title}</Typography>
              </div>
              {subtitle && <Typography variant="body2" className="text-muted-foreground">{subtitle}</Typography>}
              <div className="flex items-center gap-2 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.label}
                  </Badge>
                ))}
                {status && (
                  <Badge 
                    variant={status.type || 'default'}
                    className="text-xs"
                  >
                    {status.label}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {actionButtons.length > 0 && !isLoading && (
        <div className="flex items-center gap-2">
          {actionButtons.map((button) => (
            <Button
              key={button.id}
              onClick={button.onClick}
              variant={button.variant || 'default'}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// Year Selector Header with Select component
interface YearSelectorHeaderProps extends BaseHeaderProps {
  title: string
  subtitle?: string
  currentYear: string
  years: string[]
  onYearChange: (year: string) => void
  status?: {
    label: string
    type?: 'default' | 'secondary' | 'destructive'
  }
  actionButtons?: Array<{
    id: string
    label: string
    icon?: ReactNode
    onClick?: () => void
    variant?: 'default' | 'secondary' | 'destructive' | 'tertiary' | 'outline' | 'ghost' | 'link'
  }>
}

export function YearSelectorHeader({
  title,
  subtitle,
  currentYear,
  years,
  onYearChange,
  status,
  actionButtons = [],
  className,
  isLoading = false
}: YearSelectorHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full h-full", className)}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          {isLoading ? (
            <>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-1" />
              {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Typography variant="h2" className="text-xl">{title}</Typography>
              </div>
              {subtitle && <Typography variant="body2" className="text-muted-foreground mt-1">{subtitle}</Typography>}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
            </>
          ) : (
            <>
              <Typography variant="body2" className="text-sm font-medium">Academic year:</Typography>
              <Select value={currentYear} onValueChange={onYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        {actionButtons.length > 0 && !isLoading && (
          <div className="flex items-center gap-2">
            {actionButtons.map((button) => (
              <Button
                key={button.id}
                onClick={button.onClick}
                variant={button.variant || 'default'}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Student Application Header - specialized for student application pages
interface StudentApplicationHeaderProps extends BaseHeaderProps {
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
}

export function StudentApplicationHeader({
  studentName,
  program,
  status,
  avatarUrl,
  tags = [],
  actionButtons = [],
  className,
  isLoading = false
}: StudentApplicationHeaderProps) {
  // Format status for display
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'approved': return 'Approved'
      case 'pending_review': return 'Pending Review'
      case 'under_review': return 'Under Review'
      case 'rejected': return 'Rejected'
      default: return 'Uninvited'
    }
  }

  // Get status type for badge styling using chip variants
  const getStatusChipVariant = (status: string) => {
    switch(status) {
      case 'approved': return 'chip-green'
      case 'pending_review': return 'chip-amber'
      case 'under_review': return 'chip-blue'
      case 'rejected': return 'chip-red'
      default: return 'chip-gray'
    }
  }

  // Fallback avatar URL if none provided
  const getFallbackAvatarUrl = (name: string) => {
    const seed = name.toLowerCase().replace(/\s+/g, '_')
    return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}&backgroundColor=fffaf0&size=200`
  }

  return (
    <div className={cn("flex items-center justify-between w-full h-full", className)}>
      
      <div className="flex items-center gap-4">
        {isLoading ? (
          <>
            {/* Skeleton Avatar */}
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
            {/* Skeleton Student Info */}
            <div className="flex flex-col">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-1" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Student Profile Photo */}
            <Avatar className="h-12 w-12 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)]">
              <AvatarImage 
                src={avatarUrl || getFallbackAvatarUrl(studentName)} 
                alt={studentName}
              />
              <AvatarFallback className="text-lg">
                {studentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            {/* Student Info */}
            <div className="flex flex-col">
              <Typography variant="h2" className="text-xl font-semibold mb-1">{studentName}</Typography>
              <div className="flex items-center gap-2">
                <Badge variant="chip-blue" className="text-xs rounded-sm">
                  J1 2025-2026
                </Badge>
                <Badge 
                  variant={getStatusChipVariant(status) as 'chip-green' | 'chip-amber' | 'chip-blue' | 'chip-red' | 'chip-gray'}
                  className="text-xs rounded-sm"
                >
                  Status: {getStatusLabel(status)}
                </Badge>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {actionButtons.length > 0 && !isLoading && (
          <div className="flex items-center gap-2">
            {actionButtons.map((button) => (
              <Button
                key={button.id}
                onClick={button.onClick}
                variant={button.variant || 'default'}
                size="lg"
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * HeaderUserArea - component for the user profile section in the header
 */
export function HeaderUserArea({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        {isLoading ? (
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        ) : (
          <div className="font-medium">Gerald Thomson</div>
        )}
      </div>
      <div 
        className="flex w-[3.125rem] h-[3.125rem] items-start gap-[0.625rem] flex-shrink-0 rounded-[0.5rem] border border-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10),0px_1px_2px_0px_rgba(16,24,40,0.06)] overflow-hidden"
      >
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : (
          <img 
            src="https://api.dicebear.com/9.x/open-peeps/svg?seed=gerald_thomson_gerald-thomson&backgroundColor=fffaf0&size=200&head=noHair2&face=old&accessories=glasses2&facialHair=full" 
            alt="Gerald Thomson" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
} 