import { useSelect, type CrudFilter } from "@refinedev/core";

import { Combobox } from "@/components/ui/combobox";

interface ComboboxFieldProps {
  resource: string;
  value?: string | number | null;
  onChange: (value: string | number | undefined) => void;
  optionLabel?: string;
  optionValue?: string;
  filters?: CrudFilter[];
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
}

export function ComboboxField({
  resource,
  value,
  onChange,
  optionLabel = "name",
  optionValue = "id",
  filters,
  defaultValue,
  placeholder = "Select...",
  disabled,
}: ComboboxFieldProps) {
  const { options, onSearch, query } = useSelect({
    resource,
    optionLabel: optionLabel as any,
    optionValue: optionValue as any,
    filters,
    defaultValue,
  });

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      loading={query.isLoading}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
