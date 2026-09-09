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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const schema = z.object({
  classId: z.coerce.number({ message: "Required" }),
});

type FormValues = z.infer<typeof schema>;

// POST /api/enrollments only accepts { classId } — the student is always
// the currently logged-in account. To enroll a *different* student, edit
// an existing enrollment instead.
export const EnrollmentCreate = () => {
  const form = useResourceForm<FormValues>(schema, { resource: "enrollments", action: "create" });

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
      <Alert>
        <AlertTitle>This enrolls your own account</AlertTitle>
        <AlertDescription>
          The API takes the student id from your session, not from a field in this form. To move an
          existing enrollment to a different student, use Edit instead.
        </AlertDescription>
      </Alert>
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ResourceFormShell>
  );
};
