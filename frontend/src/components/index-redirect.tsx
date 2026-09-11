import { Navigate } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import type { AuthUser } from "@/providers/authProvider";

export function IndexRedirect() {
  const { data: identity, isLoading } = useGetIdentity<AuthUser>();
  if (isLoading) return null;
  return <Navigate to={identity?.role === "admin" ? "/dashboard" : "/departments"} replace />;
}
