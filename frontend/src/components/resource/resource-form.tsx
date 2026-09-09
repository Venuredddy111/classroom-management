import { useEffect, type ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodDefault, ZodEnum, ZodNumber, ZodObject, ZodOptional, ZodString, type ZodType } from "zod";
import { useForm as useRefineHookForm } from "@refinedev/react-hook-form";
import type { BaseRecord, HttpError } from "@refinedev/core";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// Derives empty-but-defined default values from a zod object schema so every
// field starts controlled (avoids React's "uncontrolled to controlled" warning
// once the loaded record is applied via reset()).
function emptyDefaultsFromSchema(schema: ZodType<any, any, any>): Record<string, unknown> {
  if (!(schema instanceof ZodObject)) return {};
  const shape = schema.shape as Record<string, ZodType<any, any, any>>;
  const defaults: Record<string, unknown> = {};
  for (const key in shape) {
    let field: ZodType<any, any, any> = shape[key];
    if (field instanceof ZodDefault) {
      defaults[key] = field._def.defaultValue();
      continue;
    }
    if (field instanceof ZodOptional) field = field.unwrap();
    if (field instanceof ZodString) defaults[key] = "";
    else if (field instanceof ZodNumber) defaults[key] = undefined;
    else if (field instanceof ZodEnum) defaults[key] = "";
    else defaults[key] = undefined;
  }
  return defaults;
}

export function useResourceForm<TVariables extends FieldValues, TData extends BaseRecord = BaseRecord>(
  schema: ZodType<TVariables, any, any>,
  options?: { resource?: string; id?: string; action?: "create" | "edit" },
  // Unwraps the loaded record before resetting the form with it — needed for
  // resources like departments whose GET-by-id endpoint returns a nested
  // shape (e.g. { department, totals }) rather than the flat record itself.
  unwrapData?: (data: any) => TVariables
) {
  const form = useRefineHookForm<TData, HttpError, TVariables>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaultsFromSchema(schema) as any,
    refineCoreProps: options,
  });

  // @refinedev/react-hook-form only pushes loaded data into fields already
  // registered via register() — shadcn's FormField always uses Controller,
  // which registers asynchronously and can race with that sync. Reset
  // explicitly once the record loads so every field is reliably prefilled.
  const data = form.refineCore.query?.data?.data;
  useEffect(() => {
    if (data) {
      form.reset((unwrapData ? unwrapData(data) : data) as TVariables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return form;
}

interface ResourceFormShellProps<TVariables extends FieldValues> {
  form: UseFormReturn<TVariables> & { refineCore: { onFinish: (values: TVariables) => void } };
  children: ReactNode;
  isLoading?: boolean;
}

export function ResourceFormShell<TVariables extends FieldValues>({
  form,
  children,
  isLoading,
}: ResourceFormShellProps<TVariables>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => form.refineCore.onFinish(values))}
        className="max-w-xl space-y-4"
      >
        {children}
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </form>
    </Form>
  );
}
