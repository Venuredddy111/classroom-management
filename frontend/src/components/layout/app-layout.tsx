import { Link, Outlet, useLocation } from "react-router";
import { useGetIdentity, useLogout, useMenu } from "@refinedev/core";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/providers/authProvider";
import { GlobalSearch } from "@/components/layout/global-search";

export function AppLayout() {
  const { menuItems, selectedKey } = useMenu();
  const { data: identity } = useGetIdentity<AuthUser>();
  const { mutate: logout } = useLogout();
  const location = useLocation();

  if (identity && identity.status !== "approved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">
          {identity.status === "rejected" ? "Account not approved" : "Waiting for approval"}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {identity.status === "rejected"
            ? "Your account request was not approved. Contact an administrator if you believe this is a mistake."
            : "Your account is pending approval from an admin or teacher. You'll get access once it's approved."}
        </p>
        <Button variant="outline" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    );
  }

  const visibleMenuItems = menuItems.filter(
    (item) =>
      (item.name !== "dashboard" || identity?.role === "admin") &&
      (item.name !== "approvals" || identity?.role === "admin" || identity?.role === "teacher") &&
      (item.name !== "users" || identity?.role === "admin")
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="border-b px-4 py-4 text-lg font-semibold">Classroom</div>
        <nav className="flex-1 space-y-1 p-2">
          {visibleMenuItems.map((item) => {
            const isActive =
              item.key === selectedKey || location.pathname.startsWith(item.route ?? "\0");
            return (
              <Link
                key={item.key}
                to={item.route ?? "/"}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <GlobalSearch />
          <div className="flex items-center gap-3">
            {identity && (
              <div className="text-right text-sm">
                <div className="font-medium">{identity.name}</div>
                <div className="text-muted-foreground">{identity.email}</div>
              </div>
            )}
            <Button variant="outline" size="icon" onClick={() => logout()}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
