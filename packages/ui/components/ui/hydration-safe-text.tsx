import * as React from "react"
import { cn } from "../../lib/utils"

interface HydrationSafeTextProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  [key: string]: any
}

/**
 * A component that safely handles text content hydration mismatches
 * by suppressing hydration warnings for text elements.
 * 
 * Use this wrapper for any text content that might differ between
 * server and client rendering (dates, numbers, dynamic content, etc.)
 */
export function HydrationSafeText({ 
  children, 
  className, 
  as: Component = "span",
  ...props 
}: HydrationSafeTextProps) {
  const ElementType = Component as React.ElementType
  return (
    <ElementType 
      className={cn(className)} 
      suppressHydrationWarning={true}
      {...props}
    >
      {children}
    </ElementType>
  )
}

/**
 * Hook to create hydration-safe text components
 * Returns a component that suppresses hydration warnings
 */
export function useHydrationSafeText() {
  return React.useCallback(({ children, className, as = "span", ...props }: HydrationSafeTextProps) => (
    <HydrationSafeText as={as} className={className} {...props}>
      {children}
    </HydrationSafeText>
  ), [])
}

/**
 * Wrapper for numeric values that might change between server/client
 */
export function HydrationSafeNumber({ 
  value, 
  className, 
  ...props 
}: Omit<HydrationSafeTextProps, 'children'> & { value: string | number }) {
  return (
    <HydrationSafeText className={className} {...props}>
      {value}
    </HydrationSafeText>
  )
}

/**
 * Wrapper for badge content that might change between server/client
 */
export function HydrationSafeBadge({ 
  children, 
  className, 
  ...props 
}: HydrationSafeTextProps) {
  return (
    <HydrationSafeText className={className} {...props}>
      {children}
    </HydrationSafeText>
  )
} 