import { useShow } from "@refinedev/core";
import { Descriptions } from "@/components/resource/descriptions";

interface DepartmentShowData {
  department: {
    code: string;
    name: string;
    description?: string | null;
    createdAt: string;
  };
  totals: {
    subjects: number;
    classes: number;
    enrolledStudents: number;
  };
}

export const DepartmentShow = () => {
  const { query } = useShow<DepartmentShowData>({ resource: "departments" });
  const record = query.data?.data;

  if (query.isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Descriptions
        title="Department"
        items={[
          { label: "Code", value: record?.department?.code },
          { label: "Name", value: record?.department?.name },
          { label: "Description", value: record?.department?.description || "—" },
          { label: "Created", value: record?.department?.createdAt },
        ]}
      />
      <Descriptions
        title="Totals"
        items={[
          { label: "Subjects", value: record?.totals?.subjects },
          { label: "Classes", value: record?.totals?.classes },
          { label: "Enrolled students", value: record?.totals?.enrolledStudents },
        ]}
      />
    </div>
  );
};
