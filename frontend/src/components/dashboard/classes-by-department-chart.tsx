import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

const BLUE = "#2a78d6";

export function ClassesByDepartmentChart({ data }: { data: DashboardStats["classesByDepartment"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Classes by department</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
            <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#898781" }} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#898781" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} />
            <Bar dataKey="count" name="Classes" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
