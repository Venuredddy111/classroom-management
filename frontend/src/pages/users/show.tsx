import { useShow } from "@refinedev/core";
import type { Role, User } from "@/types";
import { Descriptions } from "@/components/resource/descriptions";
import { Badge } from "@/components/ui/badge";

const roleVariant: Record<Role, "destructive" | "default" | "secondary"> = {
  admin: "destructive",
  teacher: "default",
  student: "secondary",
};

export const UserShow = () => {
  const { query } = useShow<User>({ resource: "users" });
  const record = query.data?.data;

  if (query.isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Descriptions
      items={[
        { label: "ID", value: record?.id },
        { label: "Name", value: record?.name },
        { label: "Email", value: record?.email },
        {
          label: "Role",
          value: record?.role ? <Badge variant={roleVariant[record.role]}>{record.role}</Badge> : null,
        },
        { label: "Email verified", value: record?.emailVerified ? "Yes" : "No" },
        { label: "Created", value: record?.createdAt },
      ]}
    />
  );
};
