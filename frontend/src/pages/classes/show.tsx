import { useShow } from "@refinedev/core";
import type { ClassEntity, ClassStatus } from "@/types";
import { Descriptions } from "@/components/resource/descriptions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusVariant: Record<ClassStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  archived: "outline",
};

export const ClassShow = () => {
  const { query } = useShow<ClassEntity>({ resource: "classes" });
  const record = query.data?.data;

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
          { label: "Subject ID", value: record?.subjectId },
          { label: "Teacher ID", value: record?.teacherId },
          { label: "Capacity", value: record?.capacity },
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
    </div>
  );
};
