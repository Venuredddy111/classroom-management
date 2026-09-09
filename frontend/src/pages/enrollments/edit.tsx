import { z } from "zod";
import { useResourceForm, ResourceFormShell } from "@/components/resource/resource-form";
import { ComboboxField } from "@/components/resource/combobox-field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  studentId: z.string().min(1, "Required"),
  classId: z.coerce.number({ message: "Required" }),
});

type FormValues = z.infer<typeof schema>;

export const EnrollmentEdit = () => {
  const form = useResourceForm<FormValues>(schema, { resource: "enrollments", action: "edit" });
  const studentId = form.watch("studentId");
  const classId = form.watch("classId");

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
      <FormField
        control={form.control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student</FormLabel>
            <FormControl>
              <ComboboxField
                resource="users"
                optionLabel="name"
                optionValue="id"
                filters={[{ field: "role", operator: "eq", value: "student" }]}
                value={field.value}
                onChange={field.onChange}
                defaultValue={studentId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="classId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class</FormLabel>
            <FormControl>
              <ComboboxField
                resource="classes"
                optionLabel="name"
                optionValue="id"
                value={field.value}
                onChange={field.onChange}
                defaultValue={classId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ResourceFormShell>
  );
};
