import { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@repo/ui/lib/utils'

interface LeftNavLinkProps {
  children?: ReactNode
  className?: string
  isActive?: boolean
  href?: string
  onClick?: () => void
  isLastItem?: boolean
}

export function LeftNavLink({
  children,
  className,
  isActive,
  href,
  onClick,
  isLastItem,
}: LeftNavLinkProps) {
  const commonClassNames = cn(
    "w-full px-4 py-3 text-base font-medium transition-colors relative bg-white",
    "text-center border-t border-[var(--theme-color-primary-300)]",
    "text-[var(--theme-color-primary-700)]",
    isLastItem && "border-b border-b-[var(--theme-color-primary-300)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--button-default-focus-ring)]",
    isActive ? [
      "border-x-8 border-x-[var(--theme-color-primary-300)]",
      "font-semibold",
    ] : [
      "hover:bg-[var(--button-ghost-hover-bg)]",
      "hover:text-[var(--theme-color-primary-800)]",
    ],
    className
  )
  
  if (href) {
    return (
      <Link href={href} className={commonClassNames} onClick={onClick}>
        {children}
      </Link>
    )
  }
  
  return (
    <button onClick={onClick} className={commonClassNames}>
      {children}
    </button>
  )
} 