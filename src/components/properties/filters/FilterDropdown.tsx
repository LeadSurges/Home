import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LucideIcon } from "lucide-react"

interface FilterDropdownProps {
  label: string
  icon?: LucideIcon
  value?: string | null
  options?: string[]
  onChange?: (value: string) => void
  className?: string
  children?: React.ReactNode
}

export function FilterDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  className,
  children,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`h-10 px-4 flex items-center gap-2 ${className}`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span>{value || label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {children ? (
          children
        ) : (
          options?.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => onChange?.(option)}
              className="cursor-pointer"
            >
              {option}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}