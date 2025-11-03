import { cn } from "../../lib/utils"
import { ElementType } from "react"

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant
  as?: ElementType
}

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-semibold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  body1: 'text-base',
  body2: 'text-sm',
  caption: 'text-xs'
}

const defaultElements: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span'
}

export function Typography({ 
  variant = 'body1', 
  as: Component,
  className,
  ...props 
}: TypographyProps) {
  const Tag = Component || defaultElements[variant]

  return (
    <Tag 
      className={cn(
        variantClasses[variant],
        'text-foreground',
        className
      )}
      {...props}
    />
  )
} 