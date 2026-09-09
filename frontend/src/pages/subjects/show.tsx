import { useShow } from "@refinedev/core";
import type { Subject } from "@/types";
import { Descriptions } from "@/components/resource/descriptions";

export const SubjectShow = () => {
  const { query } = useShow<Subject>({ resource: "subjects" });
  const record = query.data?.data;

  if (query.isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Descriptions
        items={[
          { label: "Code", value: record?.code },
          { label: "Name", value: record?.name },
          { label: "Department", value: record?.department?.name ?? record?.departmentId },
          { label: "Description", value: record?.description || "—" },
          { label: "Created", value: record?.createdAt },
        ]}
      />
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground">Note</h3>
        <p className="mt-1 text-sm">
          Use the Classes list, filtered by subject, to see classes offered for this subject.
        </p>
      </div>
    </div>
  );
};
