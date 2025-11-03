import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@repo/ui/lib/utils"

type LabelVariant = "default" | "radio" | "checkbox"

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  variant?: LabelVariant
}

function Label({
  className,
  variant = "default",
  htmlFor,
  ...props
}: LabelProps) {
  const ref = React.useRef<HTMLLabelElement>(null)
  
  // Auto-detect if this label is for a radio button or checkbox
  const [detectedVariant, setDetectedVariant] = React.useState<LabelVariant>(variant)
  
  React.useEffect(() => {
    if (variant !== "default") {
      setDetectedVariant(variant)
      return
    }
    
    if (htmlFor && ref.current) {
      // Check if the associated element is a radio button or checkbox
      const associatedElement = document.getElementById(htmlFor)
      if (associatedElement) {
        const inputType = associatedElement.getAttribute('type') || 
                         associatedElement.getAttribute('role') ||
                         associatedElement.tagName.toLowerCase()
        
        if (inputType === 'radio' || associatedElement.hasAttribute('data-state') || 
            associatedElement.closest('[role="radiogroup"]')) {
          setDetectedVariant("radio")
        } else if (inputType === 'checkbox' || associatedElement.hasAttribute('data-state')) {
          setDetectedVariant("checkbox")
        }
      }
    }
  }, [htmlFor, variant])
  
  const getTextSize = () => {
    if (detectedVariant === "radio" || detectedVariant === "checkbox") {
      return "text-md"
    }
    return "text-sm"
  }
  
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 leading-normal font-normal text-gray-700 tracking-[0.00938rem] select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        getTextSize(),
        className
      )}
      htmlFor={htmlFor}
      {...props}
    />
  )
}

export { Label }
