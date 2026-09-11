import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Enrollment } from "@/types";
import { useResourceTable, DataTable, RowActions } from "@/components/resource/data-table";
import { Input } from "@/components/ui/input";

const columns: ColumnDef<Enrollment>[] = [
  { accessorKey: "id", header: "ID", enableSorting: false },
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => row.original.student?.name ?? row.original.studentId,
  },
  { accessorKey: "classId", header: "Class ID" },
  { accessorKey: "enrolledAt", header: "Enrolled At" },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <RowActions resource="enrollments" id={row.original.id} />,
  },
];

export const EnrollmentList = () => {
  const table = useResourceTable<Enrollment>("enrollments", columns);
  const [classId, setClassId] = useState("");
  const [enrolledFrom, setEnrolledFrom] = useState("");
  const [enrolledTo, setEnrolledTo] = useState("");

  return (
    <DataTable
      table={table}
      columns={columns}
      toolbar={
        <div className="flex flex-wrap gap-2">
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
          <Input
            type="date"
            className="w-40"
            value={enrolledFrom}
            onChange={(e) => {
              setEnrolledFrom(e.target.value);
              table.refineCore.setFilters(
                [{ field: "enrolledFrom", operator: "eq", value: e.target.value }],
                "merge"
              );
            }}
          />
          <Input
            type="date"
            className="w-40"
            value={enrolledTo}
            onChange={(e) => {
              setEnrolledTo(e.target.value);
              table.refineCore.setFilters(
                [{ field: "enrolledTo", operator: "eq", value: e.target.value }],
                "merge"
              );
            }}
          />
        </div>
      }
    />
  );
};
