import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

// Fixed categorical order — never reassigned by rank/value.
const ROLE_COLORS: Record<string, string> = {
  admin: "#2a78d6",
  teacher: "#eb6834",
  student: "#1baf7a",
};

export function UsersByRoleChart({ data }: { data: DashboardStats["usersByRole"] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Users by role</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="role" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? "#898781"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No users yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
