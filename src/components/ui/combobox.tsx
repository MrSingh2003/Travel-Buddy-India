"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"
import { Input } from "./input"

type ComboboxProps = {
    options: { value: string; label: string }[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
}

export function Combobox({ options, value, onChange, placeholder, searchPlaceholder }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder || "Select option..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={searchPlaceholder || "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
            <div className="p-1">
              {filteredOptions.length > 0 ? filteredOptions.map((option) => (
                <Button
                    key={option.value}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal h-9", value === option.value && "font-semibold")}
                    onClick={() => {
                        onChange(option.value === value ? "" : option.value)
                        setOpen(false)
                        setSearch("")
                    }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </Button>
              )) : (
                <p className="text-center text-sm text-muted-foreground py-4">No results found.</p>
              )}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
