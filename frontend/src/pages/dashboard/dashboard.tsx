import { useCustom } from "@refinedev/core";
import { Building2, GraduationCap, Layers, Users, UserSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";
import { EnrollmentTrendChart } from "@/components/dashboard/enrollment-trend-chart";
import { ClassesByDepartmentChart } from "@/components/dashboard/classes-by-department-chart";
import { CapacityDistributionChart } from "@/components/dashboard/capacity-distribution-chart";
import { UsersByRoleChart } from "@/components/dashboard/users-by-role-chart";

const API_URL = import.meta.env.VITE_API_URL;

const overviewCards = [
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "subjects", label: "Subjects", icon: Layers },
  { key: "classes", label: "Classes", icon: GraduationCap },
  { key: "enrollments", label: "Enrollments", icon: UserSquare2 },
  { key: "users", label: "Users", icon: Users },
] as const;

export const DashboardPage = () => {
  const { result, query } = useCustom<DashboardStats>({
    url: `${API_URL}/dashboard/stats`,
    method: "get",
  });

  const stats = result?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {overviewCards.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {query.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totals[key] ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EnrollmentTrendChart data={stats?.enrollmentTrend ?? []} />
          <ClassesByDepartmentChart data={stats?.classesByDepartment ?? []} />
          <CapacityDistributionChart data={stats?.capacityDistribution ?? []} />
          <UsersByRoleChart data={stats?.usersByRole ?? []} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : stats?.activity.length ? (
            <ul className="divide-y">
              {stats.activity.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{new Date(item.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
