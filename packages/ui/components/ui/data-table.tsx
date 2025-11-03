"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  OnChangeFn,
  ColumnPinningState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table"
import { Checkbox } from "@repo/ui/components/ui/checkbox"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableRowSelection?: boolean
  columnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnPinning,
  onColumnPinningChange,
  enableRowSelection = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns: enableRowSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
          },
          ...columns,
        ]
      : columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,
    onSortingChange,
    onColumnPinningChange,
    state: {
      sorting,
      pagination: pagination ?? { pageIndex: 0, pageSize: 10 },
      columnPinning: columnPinning ?? { left: [], right: [] },
    },
    enableRowSelection,
  })

  return (
    <div className="relative overflow-x-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();
                const styles = {
                  position: isPinned ? 'sticky' : 'relative',
                  left: isPinned === 'left' ? `${header.column.getStart()}px` : undefined,
                  right: isPinned === 'right' ? `${header.column.getAfter()}px` : undefined,
                  width: header.getSize(),
                  zIndex: isPinned ? 1 : 0,
                  backgroundColor: 'hsl(var(--background))',
                } as React.CSSProperties;

                return (
                  <TableHead
                    key={header.id}
                    style={styles}
                    className="whitespace-nowrap px-3 py-2"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const isPinned = cell.column.getIsPinned();
                  const styles = {
                    position: isPinned ? 'sticky' : 'relative',
                    left: isPinned === 'left' ? `${cell.column.getStart()}px` : undefined,
                    right: isPinned === 'right' ? `${cell.column.getAfter()}px` : undefined,
                    width: cell.column.getSize(),
                    zIndex: isPinned ? 1 : 0,
                    backgroundColor: 'hsl(var(--background))',
                  } as React.CSSProperties;

                  return (
                    <TableCell
                      key={cell.id}
                      style={styles}
                      className="whitespace-nowrap px-3 py-2"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 