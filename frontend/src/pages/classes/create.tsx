import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus, Minus } from "lucide-react";

import { useResourceForm, ResourceFormShell } from "@/components/resource/resource-form";
import { ComboboxField } from "@/components/resource/combobox-field";
import { CloudinaryUploadField } from "@/components/resource/cloudinary-upload-field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const scheduleSchema = z.object({
  day: z.string().min(1, "Day"),
  startTime: z.string().min(1, "Start"),
  endTime: z.string().min(1, "End"),
});

const schema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(255, "Must be 255 characters or fewer"),
  inviteCode: z
    .string({ required_error: "Invite code is required" })
    .min(1, "Invite code is required")
    .max(20, "Must be 20 characters or fewer"),
  subjectId: z.coerce.number({
    required_error: "Please select a subject",
    invalid_type_error: "Please select a subject",
  }),
  teacherId: z
    .string({ required_error: "Please select a teacher" })
    .min(1, "Please select a teacher"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number" })
    .min(1, "Capacity must be at least 1")
    .default(50),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  description: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerCldPubId: z.string().optional(),
  schedules: z.array(scheduleSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

export const ClassCreate = () => {
  const form = useResourceForm<FormValues>(schema, { resource: "classes", action: "create" });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "schedules" });

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
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
        name="inviteCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invite Code</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="subjectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl>
              <ComboboxField
                resource="subjects"
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
        name="teacherId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teacher</FormLabel>
            <FormControl>
              <ComboboxField
                resource="users"
                optionLabel="name"
                optionValue="id"
                filters={[{ field: "role", operator: "eq", value: "teacher" }]}
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
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capacity</FormLabel>
            <FormControl>
              <Input type="number" min={1} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
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
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bannerUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Banner Image</FormLabel>
            <FormControl>
              <CloudinaryUploadField
                value={field.value}
                onChange={(result) => {
                  field.onChange(result?.url ?? "");
                  form.setValue("bannerCldPubId", result?.publicId ?? "");
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Schedule</FormLabel>
        <div className="mt-2 space-y-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                placeholder="Mon"
                className="w-24"
                {...form.register(`schedules.${index}.day` as const)}
              />
              <Input
                placeholder="09:00"
                className="w-24"
                {...form.register(`schedules.${index}.startTime` as const)}
              />
              <Input
                placeholder="10:00"
                className="w-24"
                {...form.register(`schedules.${index}.endTime` as const)}
              />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                <Minus className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => append({ day: "", startTime: "", endTime: "" })}
        >
          <Plus className="size-4" />
          Add schedule slot
        </Button>
      </div>
    </ResourceFormShell>
  );
};
