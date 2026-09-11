import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

const BLUE = "#2a78d6";

export function EnrollmentTrendChart({ data }: { data: DashboardStats["enrollmentTrend"] }) {
  const formatted = data.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Enrollment trend (last 30 days)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#898781" }} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#898781" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Enrollments" stroke={BLUE} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
