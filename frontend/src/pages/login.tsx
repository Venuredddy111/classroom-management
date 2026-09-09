import { useLogin } from "@refinedev/core";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export const Login = () => {
  const { mutate: login, isPending, error } = useLogin<FormValues>();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle>Classroom Management</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => login(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                Sign in
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
