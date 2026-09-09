import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Enrollment } from "@/types";
import { useResourceTable, DataTable, RowActions } from "@/components/resource/data-table";
import { Input } from "@/components/ui/input";

const columns: ColumnDef<Enrollment>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "studentId", header: "Student ID" },
  { accessorKey: "classId", header: "Class ID" },
  { accessorKey: "enrolledAt", header: "Enrolled At" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions resource="enrollments" id={row.original.id} />,
  },
];

export const EnrollmentList = () => {
  const table = useResourceTable<Enrollment>("enrollments", columns);
  const [classId, setClassId] = useState("");

  return (
    <DataTable
      table={table}
      columns={columns}
      toolbar={
        <Input
          type="number"
          placeholder="Filter by class ID"
          className="max-w-xs"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            table.refineCore.setFilters([{ field: "classId", operator: "eq", value: e.target.value }], "merge");
          }}
        />
      }
    />
  );
};
