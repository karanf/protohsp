import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/ui/lib/utils"
import { CircleAlert, AlertTriangle, Info, CheckCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        error: "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)] text-[var(--alert-error-text)]",
        warning: "bg-[var(--alert-warning-bg)] border-[var(--alert-warning-border)] text-[var(--alert-warning-text)]",
        info: "bg-[var(--alert-info-bg)] border-[var(--alert-info-border)] text-[var(--alert-info-text)]",
        success: "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)] text-[var(--alert-success-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const AlertIcon = {
  error: CircleAlert,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const alertIconVariants = cva("size-5", {
  variants: {
    variant: {
      default: "text-foreground",
      error: "text-[var(--alert-error-icon-color)]",
      warning: "text-[var(--alert-warning-icon-color)]",
      info: "text-[var(--alert-info-icon-color)]",
      success: "text-[var(--alert-success-icon-color)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
}

function Alert({
  className,
  variant,
  title,
  description,
  children,
  ...props
}: AlertProps) {
  const Icon = variant && variant !== "default" ? AlertIcon[variant] : null;

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className={cn(alertIconVariants({ variant }), "mt-0.75")} />}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium",
        "text-md",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-md [&_p]:leading-relaxed text-wrap",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
