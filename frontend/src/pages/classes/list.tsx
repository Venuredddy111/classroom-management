import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useList } from "@refinedev/core";
import type { ClassEntity, ClassStatus, Subject, User } from "@/types";
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

// Radix Select doesn't allow an empty-string item value, so "clear this
// filter" needs its own sentinel rather than an actual value.
const ALL = "__all__";

const columns: ColumnDef<ClassEntity>[] = [
  {
    id: "banner",
    header: "Banner",
    cell: ({ row }) =>
      row.original.bannerUrl ? (
        <img
          src={row.original.bannerUrl}
          alt={row.original.name}
          className="size-10 rounded object-cover"
        />
      ) : (
        <div className="size-10 rounded bg-muted" />
      ),
  },
  { accessorKey: "name", header: "Class Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<ClassStatus>();
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    id: "subject",
    header: "Subject",
    cell: ({ row }) => row.original.subject?.name ?? row.original.subjectId,
  },
  {
    id: "teacher",
    header: "Teacher",
    cell: ({ row }) => row.original.teacher?.name ?? row.original.teacherId,
  },
  { accessorKey: "capacity", header: "Capacity" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions resource="classes" id={row.original.id} />,
  },
];

export const ClassList = () => {
  const table = useResourceTable<ClassEntity>("classes", columns);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [teacherFilter, setTeacherFilter] = useState(ALL);

  const { result: subjects } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });
  const { result: teachers } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

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
          <Select
            value={subjectFilter}
            onValueChange={(value) => {
              setSubjectFilter(value);
              table.refineCore.setFilters(
                [{ field: "subject", operator: "eq", value: value === ALL ? "" : value }],
                "merge"
              );
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All subjects</SelectItem>
              {subjects.data.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={teacherFilter}
            onValueChange={(value) => {
              setTeacherFilter(value);
              table.refineCore.setFilters(
                [{ field: "teacher", operator: "eq", value: value === ALL ? "" : value }],
                "merge"
              );
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All teachers</SelectItem>
              {teachers.data.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
};
