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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  departmentId: z.coerce.number({ message: "Required" }),
  code: z.string().min(1, "Required").max(50),
  name: z.string().min(1, "Required").max(255),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const SubjectEdit = () => {
  const form = useResourceForm<FormValues>(schema, { resource: "subjects", action: "edit" });

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
      <FormField
        control={form.control}
        name="departmentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <ComboboxField
                resource="departments"
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
