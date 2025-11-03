import * as React from "react"
import { cn } from "@repo/ui/lib/utils"
import { Card, CardContent } from "./card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { AnimatedNumber } from "./animated-number"
import { LucideIcon } from "lucide-react"
import { Badge } from "./badge"
import { HydrationSafeText, HydrationSafeNumber, HydrationSafeBadge } from "./hydration-safe-text"

interface MetricProps {
  title: string
  value: string | number
  unit?: string
  icon?: LucideIcon
  change?: {
    value: number
    timeframe: string
    type: "increase" | "decrease"
  }
  className?: string
  variant?: "default" | "success" | "info" | "warning" | "error" | "purple" | "indigo" | "teal" | "pink" | "slate"
  customColors?: {
    bg?: string
    border?: string
    text?: string
    icon?: string
    increase?: string
    decrease?: string
  }
  springOptions?: React.ComponentProps<typeof AnimatedNumber>["springOptions"]
}

interface MetricsProps {
  metrics: MetricProps[]
  className?: string
}

function Metric({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  change, 
  className, 
  variant = "default", 
  customColors,
  springOptions 
}: MetricProps) {
  const variantStyles = {
    default: "bg-green-50/50 border-green-200",
    success: "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)]",
    info: "bg-[var(--alert-info-bg)] border-[var(--alert-info-border)]",
    warning: "bg-[var(--alert-warning-bg)] border-[var(--alert-warning-border)]",
    error: "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)]",
    purple: "bg-purple-50/50 border-purple-500",
    indigo: "bg-indigo-50/50 border-indigo-200",
    teal: "bg-teal-50/50 border-teal-500",
    pink: "bg-pink-50/50 border-pink-200",
    slate: "bg-slate-50/50 border-slate-200",
  }

  const textColors = {
    default: "text-green-600",
    success: "text-[var(--alert-success-text)]",
    info: "text-[var(--alert-info-text)]",
    warning: "text-[var(--alert-warning-text)]",
    error: "text-[var(--alert-error-text)]",
    purple: "text-purple-900",
    indigo: "text-indigo-600",
    teal: "text-teal-800",
    pink: "text-pink-600",
    slate: "text-slate-600",
  }

  const iconColors = {
    default: "text-green-600",
    success: "text-[var(--alert-success-icon-color)]",
    info: "text-[var(--alert-info-icon-color)]",
    warning: "text-[var(--alert-warning-icon-color)]",
    error: "text-[var(--alert-error-icon-color)]",
    purple: "text-purple-500",
    indigo: "text-indigo-600",
    teal: "text-teal-500",
    pink: "text-pink-600",
    slate: "text-slate-600",
  }

  const changeColors = {
    increase: customColors?.increase || "text-green-600",
    decrease: customColors?.decrease || "text-red-600"
  }

  // For warnings and errors, increases are bad and decreases are good
  const shouldReverseIndicator = variant === "warning" || variant === "error"
  
  // Determine good/bad status based on change direction and metric type
  const isPositiveChange = shouldReverseIndicator 
    ? change?.type === "decrease" 
    : change?.type === "increase"

  // Determine badge variant based on positive/negative change
  const badgeVariant = isPositiveChange ? "solid-success" : "solid-error"

  return (
    <Card className={cn(
      "shadow-none border p-0", 
      customColors?.bg,
      {
        [variantStyles[variant]]: !customColors?.bg && !customColors?.border,
        [`border-${customColors?.border}`]: customColors?.border && typeof customColors.border === 'string'
      },
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className={cn(
              "h-4 w-4", 
              customColors?.icon || iconColors[variant]
            )} />
          )}
          <HydrationSafeText 
            className={cn(
              "text-sm font-medium", 
              customColors?.text || textColors[variant]
            )}
          >
            {title}
          </HydrationSafeText>
        </div>
        <div className="mt-2">
          {typeof value === 'number' ? (
            <AnimatedNumber 
              value={value}
              className="text-2xl font-bold"
              springOptions={springOptions}
            />
          ) : (
            <HydrationSafeText as="div" className="text-2xl font-bold">
              {value}
            </HydrationSafeText>
          )}
          {unit && <HydrationSafeText className="text-sm text-muted-foreground ml-1">{unit}</HydrationSafeText>}
          {change && (
            <div className="mt-1">
              <Badge 
                variant={badgeVariant}
                className="text-xs font-normal h-5 px-1.5 gap-0.5 rounded"
              >
                {change.type === "increase" ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                <HydrationSafeBadge>
                  {Math.abs(change.value)} {change.timeframe}
                </HydrationSafeBadge>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Metrics({ metrics, className }: MetricsProps) {
  return (
    <div className={cn("grid gap-3", className)} style={{ 
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))"
    }}>
      {metrics.map((metric, index) => (
        <Metric key={index} {...metric} />
      ))}
    </div>
  )
}

export { Metrics, Metric }
export type { MetricProps, MetricsProps } 