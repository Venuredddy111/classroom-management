import { useShow } from "@refinedev/core";
import type { Enrollment } from "@/types";
import { Descriptions } from "@/components/resource/descriptions";

export const EnrollmentShow = () => {
  const { query } = useShow<Enrollment>({ resource: "enrollments" });
  const record = query.data?.data;

  if (query.isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Descriptions
      items={[
        { label: "ID", value: record?.id },
        { label: "Student ID", value: record?.studentId },
        { label: "Class ID", value: record?.classId },
        { label: "Enrolled At", value: record?.enrolledAt },
      ]}
    />
  );
};
