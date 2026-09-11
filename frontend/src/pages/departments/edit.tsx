import { z } from "zod";
import { useResourceForm, ResourceFormShell } from "@/components/resource/resource-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  code: z.string().min(1, "Required").max(50),
  name: z.string().min(1, "Required").max(255),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const DepartmentEdit = () => {
  const form = useResourceForm<FormValues>(
    schema,
    { resource: "departments", action: "edit" },
    (data) => data.department
  );

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ResourceFormShell>
  );
};
