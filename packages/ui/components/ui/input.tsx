import * as React from "react"

import { cn } from "@repo/ui/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode
}

function Input({ className, type, startIcon, ...props }: InputProps) {
  return (
    <div className="relative">
      {startIcon && (
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          {startIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-11 w-full min-w-0 rounded-md border px-3 py-1 outline-none transition-[color,box-shadow]",
          // Typography styles
          "text-base font-normal not-italic leading-6 tracking-[0.00938rem]",
          "text-gray-900 placeholder:text-gray-400",
          // Background and border styles
          "bg-[var(--input-bg)] border-[var(--input-border)]",
          "hover:border-[var(--input-hover-border)]",
          "focus:border-[var(--input-focus-border)] focus:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--input-disabled-bg)] disabled:opacity-50",
          "placeholder:text-muted-foreground file:text-foreground",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "selection:bg-primary selection:text-primary-foreground",
          "aria-invalid:border-destructive aria-invalid:shadow-[var(--focus-ring-error)]",
          startIcon && "ps-9",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
