import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  label: string;
  value: string | number;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number | null;
  onChange: (value: string | number | undefined) => void;
  onSearch?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  loading = false,
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => String(option.value) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={!onSearch}>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={onSearch}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Loading..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={String(option.value)}
                  onSelect={() => {
                    onChange(String(option.value) === String(value) ? undefined : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
