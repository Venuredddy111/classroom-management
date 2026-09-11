import type { ColumnDef } from "@tanstack/react-table";
import { useApiUrl, useCustomMutation, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";
import type { Role, User } from "@/types";
import { useResourceTable, DataTable } from "@/components/resource/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const roleVariant: Record<Role, "destructive" | "default" | "secondary"> = {
  admin: "destructive",
  teacher: "default",
  student: "secondary",
};

function ApprovalActions({ id }: { id: string }) {
  const apiUrl = useApiUrl();
  const { mutate, mutation } = useCustomMutation();
  const invalidate = useInvalidate();

  const act = (status: "approved" | "rejected") =>
    mutate(
      { url: `${apiUrl}/users/${id}/status`, method: "put", values: { status } },
      {
        onSuccess: () => {
          toast.success(status === "approved" ? "Approved" : "Rejected");
          invalidate({ resource: "users/pending", invalidates: ["list"] });
        },
        onError: (error: any) => toast.error(error?.message ?? "Action failed"),
      }
    );

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" disabled={mutation.isPending} onClick={() => act("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => act("rejected")}>
        Reject
      </Button>
    </div>
  );
}

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue<Role>();
      return <Badge variant={roleVariant[role]}>{role}</Badge>;
    },
  },
  { accessorKey: "createdAt", header: "Signed up" },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <ApprovalActions id={row.original.id} />,
  },
];

export const ApprovalsList = () => {
  const table = useResourceTable<User>("users/pending", columns);
  return <DataTable table={table} columns={columns} showCreate={false} />;
};
