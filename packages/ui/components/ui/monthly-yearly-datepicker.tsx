"use client"

import { useState, useEffect } from "react"
import { DropdownNavProps, DropdownProps } from "react-day-picker"

import { Calendar } from "@repo/ui/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import { cn } from "@repo/ui/lib/utils"

interface MonthlyYearlyDatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  startMonth?: Date
  endMonth?: Date
}

export function MonthlyYearlyDatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  startMonth = new Date(1980, 0),
  endMonth = new Date(2030, 11),
}: MonthlyYearlyDatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  )

  useEffect(() => {
    if (value) {
      const newDate = typeof value === 'string' ? new Date(value) : value
      setDate(newDate)
    }
  }, [value])

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  return (
    <div className={cn("w-fit", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md border p-2"
        classNames={{
          month_caption: "mx-0",
        }}
        captionLayout="dropdown"
        defaultMonth={date || new Date()}
        startMonth={startMonth}
        endMonth={endMonth}
        hideNavigation
        disabled={disabled}
        components={{
          DropdownNav: (props: DropdownNavProps) => {
            return (
              <div className="flex w-fit items-center gap-2">
                {props.children}
              </div>
            )
          },
          Dropdown: (props: DropdownProps) => {
            return (
              <Select
                value={String(props.value)}
                onValueChange={(value) => {
                  if (props.onChange) {
                    handleCalendarChange(value, props.onChange)
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 w-fit font-medium text-md first:grow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                  {props.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          },
        }}
      />
    </div>
  )
} 