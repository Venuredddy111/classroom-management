import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import type { AuthUser } from "@/providers/authProvider";
import type { Role } from "@/types";

interface RequireRoleProps {
  roles: Role[];
  fallback?: string;
  children: ReactNode;
}

export function RequireRole({ roles, fallback = "/departments", children }: RequireRoleProps) {
  const { data: identity, isLoading } = useGetIdentity<AuthUser>();
  if (isLoading) return null;
  if (!identity || !roles.includes(identity.role)) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}
