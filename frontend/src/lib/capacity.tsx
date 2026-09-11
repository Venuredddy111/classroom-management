import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function capacityBadge(enrolledCount: number, capacity: number): ReactNode {
  const ratio = capacity > 0 ? enrolledCount / capacity : 0;
  if (ratio >= 1) return <Badge variant="destructive">Full</Badge>;
  if (ratio >= 0.9) return <Badge className="bg-amber-500 text-white">Nearly full</Badge>;
  return null;
}
