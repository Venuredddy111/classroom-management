import type { ReactNode } from "react";

export interface DescriptionItem {
  label: string;
  value: ReactNode;
}

interface DescriptionsProps {
  title?: string;
  items: DescriptionItem[];
}

export function Descriptions({ title, items }: DescriptionsProps) {
  return (
    <div className="max-w-xl space-y-3">
      {title && <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>}
      <dl className="divide-y rounded-md border">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-3 gap-4 px-4 py-2.5">
            <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
            <dd className="col-span-2 text-sm">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
