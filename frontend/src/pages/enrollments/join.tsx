import { useApiUrl, useCustomMutation } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  inviteCode: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

/** POST /api/enrollments/join — lets the current user enroll themselves via a class invite code. */
export const JoinClass = () => {
  const apiUrl = useApiUrl();
  const { mutate, mutation } = useCustomMutation();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { inviteCode: "" } });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Join a class</CardTitle>
        <CardDescription>Enter the invite code your teacher shared with you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              mutate(
                { url: `${apiUrl}/enrollments/join`, method: "post", values },
                {
                  onSuccess: () => {
                    toast.success("Joined the class");
                    form.reset();
                  },
                  onError: (error: any) => {
                    toast.error(error?.message ?? "Could not join class");
                  },
                }
              );
            })}
          >
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite code</FormLabel>
                  <FormControl>
                    <Input placeholder="ALG-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              Join
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
