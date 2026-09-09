import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ClassEntity, ClassStatus } from "@/types";
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

const statusVariant: Record<ClassStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  archived: "outline",
};

const columns: ColumnDef<ClassEntity>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "inviteCode", header: "Invite Code" },
  { accessorKey: "subjectId", header: "Subject ID" },
  {
    accessorKey: "teacherId",
    header: "Teacher ID",
    cell: ({ getValue }) => <span className="line-clamp-1">{getValue<string>()}</span>,
  },
  { accessorKey: "capacity", header: "Capacity" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<ClassStatus>();
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions resource="classes" id={row.original.id} />,
  },
];

export const ClassList = () => {
  const table = useResourceTable<ClassEntity>("classes", columns);
  const [search, setSearch] = useState("");

  return (
    <DataTable
      table={table}
      columns={columns}
      toolbar={
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or invite code"
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
              table.refineCore.setFilters([{ field: "status", operator: "eq", value }], "merge")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
};
