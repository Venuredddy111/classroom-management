import { useState } from "react";
import { useShow, useList, useCreate, useDelete, useInvalidate, useGetIdentity } from "@refinedev/core";
import type { AuthUser } from "@/providers/authProvider";
import type { ClassEntity, ClassStatus, Enrollment } from "@/types";
import { Descriptions } from "@/components/resource/descriptions";
import { ComboboxField } from "@/components/resource/combobox-field";
import { capacityBadge } from "@/lib/capacity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

const statusVariant: Record<ClassStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  archived: "outline",
};

export const ClassShow = () => {
  const { query } = useShow<ClassEntity>({ resource: "classes" });
  const record = query.data?.data;
  const classId = record?.id;
  const invalidate = useInvalidate();
  const { data: identity } = useGetIdentity<AuthUser>();
  const canManageEnrollments = identity?.role === "admin" || identity?.role === "teacher";
  const [studentToEnroll, setStudentToEnroll] = useState<string>();

  const { result: enrollmentsResult, query: enrollmentsQuery } = useList<Enrollment>({
    resource: "enrollments",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    pagination: { pageSize: 100 },
    queryOptions: { enabled: !!classId },
  });

  const { mutate: createEnrollment, mutation: createMutation } = useCreate();
  const { mutate: deleteEnrollment } = useDelete();

  const enrolledCount = record?.enrolledCount ?? enrollmentsResult.data.length;

  if (query.isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {record?.bannerUrl && (
        <img src={record.bannerUrl} alt={record.name} className="h-48 w-auto rounded-md border object-cover" />
      )}
      <Descriptions
        items={[
          { label: "Name", value: record?.name },
          { label: "Invite Code", value: record?.inviteCode },
          { label: "Subject", value: record?.subject?.name ?? record?.subjectId },
          { label: "Teacher", value: record?.teacher?.name ?? record?.teacherId },
          {
            label: "Capacity",
            value: (
              <span className="flex items-center gap-2">
                {enrolledCount} / {record?.capacity}
                {record && capacityBadge(enrolledCount, record.capacity)}
              </span>
            ),
          },
          {
            label: "Status",
            value: record?.status ? <Badge variant={statusVariant[record.status]}>{record.status}</Badge> : null,
          },
          { label: "Description", value: record?.description || "—" },
          { label: "Created", value: record?.createdAt },
        ]}
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Schedule</h3>
        <div className="max-w-xl rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(record?.schedules ?? []).map((s, i) => (
                <TableRow key={i}>
                  <TableCell>{s.day}</TableCell>
                  <TableCell>{s.startTime}</TableCell>
                  <TableCell>{s.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Enrolled Students</h3>
        {canManageEnrollments && (
          <div className="mb-3 flex max-w-md items-center gap-2">
            <ComboboxField
              resource="users"
              optionLabel="name"
              optionValue="id"
              filters={[{ field: "role", operator: "eq", value: "student" }]}
              value={studentToEnroll}
              onChange={(v) => setStudentToEnroll(v as string)}
              placeholder="Select a student to enroll"
            />
            <Button
              disabled={!studentToEnroll || createMutation.isPending}
              onClick={() =>
                createEnrollment(
                  { resource: `classes/${classId}/enrollments`, values: { studentId: studentToEnroll } },
                  {
                    onSuccess: () => {
                      setStudentToEnroll(undefined);
                      invalidate({ resource: "enrollments", invalidates: ["list"] });
                      invalidate({ resource: "classes", invalidates: ["detail"], id: classId });
                    },
                  }
                )
              }
            >
              Enroll
            </Button>
          </div>
        )}
        <div className="max-w-2xl rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrolled At</TableHead>
                {canManageEnrollments && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : enrollmentsResult.data.length ? (
                enrollmentsResult.data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.student?.name}</TableCell>
                    <TableCell>{e.student?.email}</TableCell>
                    <TableCell>{e.enrolledAt}</TableCell>
                    {canManageEnrollments && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            deleteEnrollment(
                              { resource: "enrollments", id: e.id },
                              {
                                onSuccess: () => {
                                  invalidate({ resource: "classes", invalidates: ["detail"], id: classId });
                                },
                              }
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No students enrolled.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
