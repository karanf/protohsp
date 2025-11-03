import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--button-border-radius)] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--button-default-bg)]",
          "text-[var(--button-default-text)]",
          "border border-[var(--button-default-border)]",
          "shadow-[var(--button-default-shadow)]",
          "hover:bg-[var(--button-default-hover-bg)]",
          "hover:border-[var(--button-default-hover-border)]",
          "hover:text-[var(--button-default-hover-text)]",
          "hover:shadow-[var(--button-default-hover-shadow)]",
          "focus:bg-[var(--button-default-focus-bg)]",
          "focus:border-[var(--button-default-focus-border)]",
          "focus:text-[var(--button-default-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
          "active:bg-[var(--button-default-active-bg)]",
          "active:border-[var(--button-default-active-border)]",
          "active:text-[var(--button-default-active-text)]",
          "active:shadow-[var(--button-default-active-shadow)]",
        ].join(" "),
        destructive: [
          "bg-[var(--button-destructive-bg)]",
          "text-[var(--button-destructive-text)]",
          "border border-[var(--button-destructive-border)]",
          "shadow-[var(--button-destructive-shadow)]",
          "hover:bg-[var(--button-destructive-hover-bg)]",
          "hover:border-[var(--button-destructive-hover-border)]",
          "hover:text-[var(--button-destructive-hover-text)]",
          "hover:shadow-[var(--button-destructive-hover-shadow)]",
          "focus:bg-[var(--button-destructive-focus-bg)]",
          "focus:border-[var(--button-destructive-focus-border)]",
          "focus:text-[var(--button-destructive-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--error-shadow-color-1),_0px_0px_0px_4px_var(--error-shadow-color-2)]",
          "active:bg-[var(--button-destructive-active-bg)]",
          "active:border-[var(--button-destructive-active-border)]",
          "active:text-[var(--button-destructive-active-text)]",
          "active:shadow-[var(--button-destructive-active-shadow)]",
        ].join(" "),
        tertiary: [
          "bg-[var(--button-tertiary-bg)]",
          "text-[var(--button-tertiary-text)]",
          "border border-[var(--button-tertiary-border)]",
          "shadow-[var(--button-tertiary-shadow)]",
          "hover:bg-[var(--button-tertiary-hover-bg)]",
          "hover:border-[var(--button-tertiary-hover-border)]",
          "hover:text-[var(--button-tertiary-hover-text)]",
          "hover:shadow-[var(--button-tertiary-hover-shadow)]",
          "focus:bg-[var(--button-tertiary-focus-bg)]",
          "focus:border-[var(--button-tertiary-focus-border)]",
          "focus:text-[var(--button-tertiary-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--tertiary-shadow-color-1),_0px_0px_0px_4px_var(--tertiary-shadow-color-2)]",
          "active:bg-[var(--button-tertiary-active-bg)]",
          "active:border-[var(--button-tertiary-active-border)]",
          "active:text-[var(--button-tertiary-active-text)]",
          "active:shadow-[var(--button-tertiary-active-shadow)]",
        ].join(" "),
        outline: [
          "bg-[var(--button-outline-bg)]",
          "text-[var(--button-outline-text)]",
          "border border-[var(--button-outline-border)]",
          "shadow-[var(--button-outline-shadow)]",
          "hover:bg-[var(--button-outline-hover-bg)]",
          "hover:border-[var(--button-outline-hover-border)]",
          "hover:text-[var(--button-outline-hover-text)]",
          "hover:shadow-[var(--button-outline-hover-shadow)]",
          "focus:bg-[var(--button-outline-focus-bg)]",
          "focus:border-[var(--button-outline-focus-border)]",
          "focus:text-[var(--button-outline-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--tertiary-shadow-color-1),_0px_0px_0px_4px_var(--tertiary-shadow-color-2)]",
          "active:bg-[var(--button-outline-active-bg)]",
          "active:border-[var(--button-outline-active-border)]",
          "active:text-[var(--button-outline-active-text)]",
          "active:shadow-[var(--button-outline-active-shadow)]",
        ].join(" "),
        secondary: [
          "bg-[var(--button-secondary-bg)]",
          "text-[var(--button-secondary-text)]",
          "[border-width:var(--button-secondary-border-width)] border-solid border-[var(--button-secondary-border)]",
          "shadow-[var(--button-secondary-shadow)]",
          "hover:bg-[var(--button-secondary-hover-bg)]",
          "hover:[border-width:var(--button-secondary-border-width)] hover:border-solid hover:border-[var(--button-secondary-hover-border)]",
          "hover:text-[var(--button-secondary-hover-text)]",
          "hover:shadow-[var(--button-secondary-hover-shadow)]",
          "focus:bg-[var(--button-secondary-focus-bg)]",
          "focus:[border-width:var(--button-secondary-border-width)] focus:border-solid focus:border-[var(--button-secondary-focus-border)]",
          "focus:text-[var(--button-secondary-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--secondary-shadow-color-1),_0px_0px_0px_4px_var(--secondary-shadow-color-2)]",
          "active:bg-[var(--button-secondary-active-bg)]",
          "active:[border-width:var(--button-secondary-border-width)] active:border-solid active:border-[var(--button-secondary-active-border)]",
          "active:text-[var(--button-secondary-active-text)]",
          "active:shadow-[var(--button-secondary-active-shadow)]",
        ].join(" "),
        ghost: [
          "bg-[var(--button-ghost-bg)]",
          "text-[var(--button-ghost-text)]",
          "border border-[var(--button-ghost-border)]",
          "shadow-[var(--button-ghost-shadow)]",
          "hover:bg-[var(--button-ghost-hover-bg)]",
          "hover:border-[var(--button-ghost-hover-border)]",
          "hover:text-[var(--button-ghost-hover-text)]",
          "hover:shadow-[var(--button-ghost-hover-shadow)]",
          "focus:bg-[var(--button-ghost-focus-bg)]",
          "focus:border-[var(--button-ghost-focus-border)]",
          "focus:text-[var(--button-ghost-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--tertiary-shadow-color-1),_0px_0px_0px_4px_var(--tertiary-shadow-color-2)]",
          "active:bg-[var(--button-ghost-active-bg)]",
          "active:border-[var(--button-ghost-active-border)]",
          "active:text-[var(--button-ghost-active-text)]",
          "active:shadow-[var(--button-ghost-active-shadow)]",
        ].join(" "),
        link: [
          "bg-[var(--button-link-bg)]",
          "text-[var(--button-link-text)]",
          "border border-[var(--button-link-border)]",
          "shadow-[var(--button-link-shadow)]",
          "hover:bg-[var(--button-link-hover-bg)]",
          "hover:border-[var(--button-link-hover-border)]",
          "hover:text-[var(--button-link-hover-text)]",
          "hover:shadow-[var(--button-link-hover-shadow)]",
          "focus:bg-[var(--button-link-focus-bg)]",
          "focus:border-[var(--button-link-focus-border)]",
          "focus:text-[var(--button-link-focus-text)]",
          "focus:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
          "active:bg-[var(--button-link-active-bg)]",
          "active:border-[var(--button-link-active-border)]",
          "active:text-[var(--button-link-active-text)]",
          "active:shadow-[var(--button-link-active-shadow)]",
          "underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        default: "px-[var(--button-padding-x)] py-[var(--button-padding-y)] has-[>svg]:px-3",
        sm: "px-3 py-1.5 has-[>svg]:px-2.5",
        lg: "px-6 py-2.5 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
