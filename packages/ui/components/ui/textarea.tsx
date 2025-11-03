import * as React from "react"

import { cn } from "@repo/ui/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-md border px-3 py-2 text-base outline-none transition-[color,box-shadow] md:text-md field-sizing-content",
        "bg-[var(--input-bg)] border-[var(--input-border)]",
        "hover:border-[var(--input-hover-border)]",
        "focus:border-[var(--input-focus-border)] focus:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--input-disabled-bg)] disabled:opacity-50",
        "placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        "aria-invalid:border-destructive aria-invalid:shadow-[var(--focus-ring-error)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
