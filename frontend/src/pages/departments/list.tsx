import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Department } from "@/types";
import { useResourceTable, DataTable, RowActions } from "@/components/resource/data-table";
import { Input } from "@/components/ui/input";

const columns: ColumnDef<Department>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => <span className="line-clamp-1">{getValue<string | null>()}</span>,
  },
  { accessorKey: "totalSubjects", header: "Subjects" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions resource="departments" id={row.original.id} />,
  },
];

export const DepartmentList = () => {
  const table = useResourceTable<Department>("departments", columns);
  const [search, setSearch] = useState("");

  return (
    <DataTable
      table={table}
      columns={columns}
      toolbar={
        <Input
          placeholder="Search by name or code"
          className="max-w-xs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            table.refineCore.setFilters([{ field: "search", operator: "eq", value: e.target.value }]);
          }}
        />
      }
    />
  );
};
