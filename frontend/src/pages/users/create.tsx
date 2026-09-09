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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  role: z.enum(["admin", "teacher", "student"]),
  emailVerified: z.boolean().default(false),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const UserCreate = () => {
  const form = useResourceForm<FormValues>(schema, { resource: "users", action: "create" });

  return (
    <ResourceFormShell form={form} isLoading={form.refineCore.formLoading}>
      <Alert>
        <AlertTitle>This creates a user record only.</AlertTitle>
        <AlertDescription>
          This admin endpoint does not set a password. To create someone who can log in themselves,
          use the Register page instead — it goes through /api/auth/sign-up/email.
        </AlertDescription>
      </Alert>
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="emailVerified"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
            <FormLabel>Email verified</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ResourceFormShell>
  );
};
