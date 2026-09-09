import { type ReactNode } from "react";
import { flexRender, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useDelete, useNavigation, type BaseKey, type BaseRecord } from "@refinedev/core";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RowActionsProps {
  resource: string;
  id: BaseKey;
  showEdit?: boolean;
  showShow?: boolean;
  showDelete?: boolean;
}

export function RowActions({ resource, id, showEdit = true, showShow = true, showDelete = true }: RowActionsProps) {
  const { edit, show } = useNavigation();
  const { mutate: deleteOne, mutation } = useDelete();

  return (
    <div className="flex justify-end gap-1">
      {showShow && (
        <Button variant="ghost" size="icon-sm" onClick={() => show(resource, id)}>
          <Eye className="size-4" />
        </Button>
      )}
      {showEdit && (
        <Button variant="ghost" size="icon-sm" onClick={() => edit(resource, id)}>
          <Pencil className="size-4" />
        </Button>
      )}
      {showDelete && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Trash2 className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this record?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={mutation.isPending}
                onClick={() => deleteOne({ resource, id })}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function useResourceTable<TData extends BaseRecord>(
  resource: string,
  columns: ColumnDef<TData, any>[]
) {
  const table = useTable<TData>({
    columns,
    getCoreRowModel: getCoreRowModel(),
    refineCoreProps: { resource },
  });
  return { ...table, resource };
}

export type ResourceTable<TData extends BaseRecord> = ReturnType<typeof useResourceTable<TData>>;

interface DataTableProps<TData extends BaseRecord> {
  table: ResourceTable<TData>;
  columns: ColumnDef<TData, any>[];
  toolbar?: ReactNode;
  showCreate?: boolean;
}

export function DataTable<TData extends BaseRecord>({
  table,
  columns,
  toolbar,
  showCreate = true,
}: DataTableProps<TData>) {
  const { reactTable, refineCore, resource } = table;
  const { result, tableQuery, currentPage, setCurrentPage, pageCount } = refineCore;
  const { create } = useNavigation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">{toolbar}</div>
        {showCreate && (
          <Button onClick={() => create(resource)}>
            <Plus className="size-4" />
            Create
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {reactTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reactTable.getRowModel().rows.length ? (
              reactTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {result.total !== undefined ? `${result.total} total` : null}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {pageCount || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
