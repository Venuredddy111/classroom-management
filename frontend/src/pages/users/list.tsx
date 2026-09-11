import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Role, User } from "@/types";
import { useResourceTable, DataTable, RowActions } from "@/components/resource/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleVariant: Record<Role, "destructive" | "default" | "secondary"> = {
  admin: "destructive",
  teacher: "default",
  student: "secondary",
};

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
  {
    accessorKey: "emailVerified",
    header: "Verified",
    enableSorting: false,
    cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <RowActions resource="users" id={row.original.id} />,
  },
];

export const UserList = () => {
  const table = useResourceTable<User>("users", columns);
  const [search, setSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  return (
    <DataTable
      table={table}
      columns={columns}
      toolbar={
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by name"
            className="max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              table.refineCore.setFilters(
                [{ field: "search", operator: "eq", value: e.target.value }],
                "merge"
              );
            }}
          />
          <Select
            onValueChange={(value) =>
              table.refineCore.setFilters([{ field: "role", operator: "eq", value }], "merge")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-40"
            value={createdFrom}
            onChange={(e) => {
              setCreatedFrom(e.target.value);
              table.refineCore.setFilters(
                [{ field: "createdFrom", operator: "eq", value: e.target.value }],
                "merge"
              );
            }}
          />
          <Input
            type="date"
            className="w-40"
            value={createdTo}
            onChange={(e) => {
              setCreatedTo(e.target.value);
              table.refineCore.setFilters(
                [{ field: "createdTo", operator: "eq", value: e.target.value }],
                "merge"
              );
            }}
          />
        </div>
      }
    />
  );
};
