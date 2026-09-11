import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

// Status palette, ordered from safest to most severe.
const BUCKET_COLORS: Record<string, string> = {
  "Under 50%": "#0ca30c",
  "50-90%": "#fab219",
  "Near full (90-100%)": "#ec835a",
  Full: "#d03b3b",
};

export function CapacityDistributionChart({ data }: { data: DashboardStats["capacityDistribution"] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Class capacity status</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="bucket" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.bucket} fill={BUCKET_COLORS[entry.bucket] ?? "#898781"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No classes yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
