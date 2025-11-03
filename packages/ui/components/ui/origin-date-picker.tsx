"use client"

import { useId, useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Label } from "@repo/ui/components/ui/label"
import { Input } from "@repo/ui/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { MonthlyYearlyDatePicker } from "@repo/ui/components/ui/monthly-yearly-datepicker"

interface OriginDatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  startMonth?: Date
  endMonth?: Date
}

export function OriginDatePicker({
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  label,
  className,
  disabled,
  startMonth,
  endMonth,
}: OriginDatePickerProps) {
  const id = useId()
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  )
  const [inputValue, setInputValue] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (value) {
      const newDate = typeof value === 'string' ? new Date(value) : value
      setDate(newDate)
      setInputValue(format(newDate, "MM/dd/yyyy"))
    }
  }, [value])

  const parseDate = (dateString: string): Date | undefined => {
    // Handle MM/dd/yyyy format
    const parts = dateString.split('/')
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const month = parseInt(parts[0], 10)
      const day = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000) {
        const date = new Date(year, month - 1, day)
        // Verify the date is valid (handles invalid dates like 02/30/2024)
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          return date
        }
      }
    }
    return undefined
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    
    const parsedDate = parseDate(value)
    if (parsedDate) {
      setDate(parsedDate)
      onChange?.(parsedDate)
    } else if (value === "") {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setInputValue(selectedDate ? format(selectedDate, "MM/dd/yyyy") : "")
    onChange?.(selectedDate)
    setIsOpen(false) // Close popover when date is selected
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full w-10 px-0 py-0 hover:bg-transparent flex items-center justify-center"
              disabled={disabled}
            >
              <CalendarIcon
                size={24}
                className="text-muted-foreground/80 hover:text-foreground transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <MonthlyYearlyDatePicker
              value={date}
              onChange={handleDateSelect}
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 