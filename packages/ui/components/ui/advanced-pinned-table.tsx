import * as React from "react"
import { CSSProperties, useRef, useState, useCallback, useMemo } from "react"
import {
  ColumnDef,
  ColumnPinningState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { cn } from "../../lib/utils"
import { Checkbox } from "./checkbox"
import { 
  ArrowUpNarrowWide, 
  ArrowDownWideNarrow,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  LucideIcon,
  Search,
  X,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronFirst,
  ChevronLast,
  ListFilterPlus,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "./dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "./pagination"

import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Button, buttonVariants } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { Tabs, TabsList, TabsTrigger } from "./tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { 
  BaseExpandedViewProps,
  DefaultExpandedView,
  ExpandedViewType,
  getExpandedView 
} from "../templates/table-expanded-views/expanded-views"
import { HydrationSafeText, HydrationSafeNumber } from "./hydration-safe-text"
import { Skeleton } from "./skeleton"

// Re-export the types from table-expanded-views
export type { ExpandedViewType, BaseExpandedViewProps } from "../templates/table-expanded-views/expanded-views";

// Skeleton loading component for table
function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filter skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      {/* Status tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-[120px] rounded-md" />
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="border rounded-md">
        {/* Header skeleton */}
        <div className="border-b p-4">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
        
        {/* Footer skeleton */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-[120px]" />
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification Indicator Component
interface NotificationIndicatorProps {
  show?: boolean;
  delay?: number; // Add stagger delay prop
  variant?: 'tab' | 'row'; // Add variant for different positioning
}

function NotificationIndicator({ show = true, delay = 0, variant = 'tab' }: NotificationIndicatorProps) {
  if (!show) return null;

  // Different positioning based on variant
  const positionStyles = variant === 'row' 
    ? { position: 'relative' as const, top: 'auto', left: 'auto', transform: 'none' }
    : { position: 'absolute' as const, top: '50%', left: '24px', transform: 'translateY(-50%)' };

  return (
    <>
      <div className="pointer-events-none" style={positionStyles}>
        {/* Core dot with fade animation for table rows */}
        <div 
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--theme-color-primary-600)',
            transform: variant === 'row' ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
            animation: variant === 'row' ? `dot-fade 3s ease-in-out infinite ${delay}s` : 'none',
          }}
        />
        {/* Sonar rings - different for table rows vs tabs */}
        {variant === 'row' ? (
          // New thin line implementation for table rows - single ping
          <div 
            className="absolute w-2 h-2 rounded-full border opacity-0"
            style={{
              borderColor: 'var(--theme-color-primary-300)',
              borderWidth: '1px',
              transform: 'translate(-50%, -50%)',
              animation: `sonar-line-sync 3s ease-out infinite ${delay}s`, // Match 3s dot cycle, same delay
            }}
          />
        ) : (
          // Keep original thick border implementation for tabs
          <>
            <div 
              className="absolute w-2 h-2 rounded-full border-2 opacity-0"
              style={{
                borderColor: 'var(--theme-color-primary-300)',
                transform: 'translate(-50%, -50%)',
                animation: 'sonar-ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
                animationDelay: `${delay}s`,
              }}
            />
            <div 
              className="absolute w-2 h-2 rounded-full border-2 opacity-0"
              style={{
                borderColor: 'var(--theme-color-primary-300)',
                transform: 'translate(-50%, -50%)',
                animation: 'sonar-ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
                animationDelay: `${delay + 2}s`,
              }}
            />
          </>
        )}
      </div>
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes dot-fade {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes sonar-line-sync {
          0%, 30% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
          30% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          45%, 100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        
        @keyframes sonar-ping {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

/**
 * AdvancedPinnedTable Component
 * 
 * A feature-rich table component with pinned columns, sorting, pagination, and row expansion capabilities.
 * Now includes data-driven loading states with skeleton loading.
 * 
 * @example
 * ```tsx
 * // Define your data type
 * type DataType = {
 *   id: string
 *   name: string
 *   // ... other fields
 * }
 * 
 * // Define your columns
 * const columns: ColumnDef<DataType>[] = [
 *   {
 *     id: "select",
 *     enablePinning: true,
 *     enableSorting: false,
 *     size: 40,
 *     header: ({ table }) => (
 *       <Checkbox
 *         checked={table.getIsAllPageRowsSelected()}
 *         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
 *       />
 *     ),
 *     cell: ({ row }) => (
 *       <Checkbox
 *         checked={row.getIsSelected()}
 *         onCheckedChange={(value) => row.toggleSelected(!!value)}
 *       />
 *     ),
 *   },
 *   // ... other columns
 * ]
 * 
 * // Use the component with data-driven loading
 * <AdvancedPinnedTable
 *   data={yourData}
 *   columns={columns}
 *   isLoading={isDataLoading} // Shows skeleton when true
 *   defaultPinnedColumns={{
 *     left: ['select', 'name'],
 *     right: ['actions']
 *   }}
 * />
 * ```
 */

export interface AdvancedPinnedTableProps<TData> {
  /**
   * The data to be displayed in the table
   */
  data: TData[]
  
  /**
   * Column definitions for the table
   */
  columns: ColumnDef<TData>[]
  
  /**
   * Whether the table is in a loading state
   * When true, shows skeleton loader instead of table content
   * @default false
   */
  isLoading?: boolean
  
  /**
   * Default pinned columns configuration
   * @default { left: [], right: [] }
   */
  defaultPinnedColumns?: {
    left?: string[]
    right?: string[]
  }
  
  /**
   * Initial sorting state
   * @default []
   */
  defaultSorting?: SortingState
  
  /**
   * Initial pagination state
   * @default { pageIndex: 0, pageSize: 10 }
   */
  defaultPagination?: PaginationState
  
  /**
   * Callback when sorting changes
   */
  onSortingChange?: (sorting: SortingState) => void
  
  /**
   * Callback when pagination changes
   */
  onPaginationChange?: (pagination: PaginationState) => void
  
  /**
   * Callback when row selection changes
   */
  onRowSelectionChange?: (selection: RowSelectionState) => void
  
  /**
   * Callback when row expansion changes
   */
  onExpandedChange?: (expanded: ExpandedState) => void
  
  /**
   * Callback when column visibility changes
   */
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  
  /**
   * Callback when column pinning changes
   */
  onColumnPinningChange?: (pinning: ColumnPinningState) => void
  
  /**
   * Whether the right sidebar is open (for width calculations)
   * @default true
   */
  isRightSidebarOpen?: boolean
  
  /**
   * Callback to render expanded content
   */
  renderExpandedContent?: (props: { row: Row<TData> }) => React.ReactNode
  
  /**
   * Type of expanded view to display
   * @default "default"
   */
  expandedViewType?: ExpandedViewType
  
  /**
   * Bulk actions configuration
   * Provide action items to be shown in the bulk actions dropdown
   */
  bulkActions?: {
    label: string
    onClick: (selectedRows: Row<TData>[]) => void
  }[]

  /**
   * Enable two-step bulk actions
   * When true, selecting a bulk action will show a "Process" button instead of executing immediately
   * @default false
   */
  enableTwoStepBulkActions?: boolean

  /**
   * Custom text for the process button
   * @default "Process"
   */
  processButtonText?: string

  /**
   * Hide the cancel button in two-step bulk actions
   * @default false
   */
  hideCancelButton?: boolean

  /**
   * Enable the search bar
   * @default false
   */
  enableSearch?: boolean

  /**
   * Placeholder for the search input
   * @default "Search..."
   */
  searchPlaceholder?: string

  /**
   * Custom search function to filter rows
   * If not provided, a default search across all visible columns will be used
   */
  searchFunction?: (row: TData, searchValue: string) => boolean

  /**
   * Initial search value
   * @default ""
   */
  initialSearchValue?: string

  /**
   * Enable status tabs filtering
   * @default false
   */
  enableStatusFilter?: boolean

  /**
   * Configuration for status tabs
   * Required when enableStatusFilter is true
   */
  statusFilters?: {
    id: string
    label: string
    count?: number
    value: string
    field: string
    color?: string
    showNotification?: boolean
  }[]

  /**
   * Hide the "All" tab in status filters
   * @default false
   */
  hideAllTab?: boolean

  /**
   * Initial selected status filter tab
   * @default undefined - uses hideAllTab logic
   */
  initialSelectedStatusFilter?: string

  /**
   * Enable advanced filters
   * @default false
   */
  enableFilters?: boolean

  /**
   * Configuration for advanced filters
   * Required when enableFilters is true
   */
  filterOptions?: {
    id: string
    label: string
    field: string
    options?: {
      label: string
      value: string
    }[]
  }[]

  /**
   * Auto-generate filter options from columns
   * When true, filter options will be generated from column definitions
   * @default false
   */
  autoGenerateFilters?: boolean

  /**
   * Tab styling for status filters
   */
  tabsClassName?: string
  
  /**
   * Tab style variants configuration
   * @default { activeVariant: "secondary", inactiveVariant: "tertiary", size: "md" }
   */
  tabStyles?: {
    activeVariant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" | "tertiary"
    inactiveVariant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" | "tertiary"
    size?: "sm" | "md" | "lg"
  }

  /**
   * Row-level notification indicators
   * Function that determines which rows should show notification indicators
   * The indicator will appear 8px to the right of text in name cells
   * Stagger animation will be applied from top to bottom regardless of sort order
   */
  getRowNotification?: (row: TData, index: number) => boolean

  /**
   * Virtual scrolling configuration
   * When enabled, only visible rows are rendered for better performance with large datasets
   */
  virtualScrolling?: {
    /**
     * Enable virtual scrolling
     * @default false
     */
    enabled?: boolean
    
    /**
     * Height of each row in pixels
     * @default 48
     */
    rowHeight?: number
    
    /**
     * Maximum height of the table container
     * @default 400
     */
    maxHeight?: number
    
    /**
     * Number of rows to render outside the visible area for smoother scrolling
     * @default 5
     */
    overscan?: number
    
    /**
     * Minimum number of rows to trigger virtualization
     * @default 100
     */
    threshold?: number
  }
}

const tableStyles = {
  root: "relative rounded-md w-full mx-auto border border-slate-200 bg-background",
  table: "[&_td]:border-slate-200 [&_th]:border-slate-200 table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b w-full",
  header: "bg-background z-20",
  headerRow: "bg-muted/50",
  headerCell: "relative h-10 data-pinned:backdrop-blur-md [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l px-3 py-2 border-b border-slate-200 [&>div]:whitespace-nowrap [&[data-pinned][data-last-col]]:border-slate-200 data-pinned:w-[var(--col-size)] data-pinned:min-w-[var(--col-size)] data-pinned:max-w-[var(--col-size)]",
  headerContent: "w-full whitespace-nowrap flex items-center transition-colors hover:text-foreground/80 cursor-pointer font-medium h-full",
  row: (isExpanded: boolean, isSelected: boolean) => 
    cn(
      "border-b border-input group",
      isExpanded ? "bg-white hover:bg-muted" : "bg-white hover:bg-muted",
      isSelected && "bg-muted"
    ),
  cell: cn(
    "align-middle border-b border-slate-200 [&>div]:whitespace-nowrap [&[data-pinned][data-last-col]]:border-slate-200 data-pinned:w-[var(--col-size)] data-pinned:min-w-[var(--col-size)] data-pinned:max-w-[var(--col-size)]",
    "data-pinned:backdrop-blur-md [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l px-3 py-2 [&>div]:whitespace-nowrap [&:has([role=checkbox])]:!px-3 [&:has([role=checkbox])]:!py-2"
  ),
  expandedRow: "border-b border-input bg-muted/50",
  noResults: "h-24 text-center",
  // Column-specific styles
  checkbox: {
    container: "flex items-center justify-center w-full h-full"
  },
  expander: {
    container: "flex h-full w-full items-center justify-center",
    button: "h-6 w-6 flex items-center justify-center",
    icon: (isExpanded: boolean) => cn("h-4 w-4 transition-transform", {
      "transform -rotate-90": !isExpanded,
    })
  },
  name: {
    container: "flex items-center gap-2 w-full min-w-0",
    avatar: "h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center text-xs flex-shrink-0",
    textContainer: "flex flex-col min-w-0 flex-1",
    primary: "font-medium truncate w-full",
    secondary: "text-xs text-gray-500 truncate w-full"
  },
  status: {
    badge: (color: string) => cn(
      "inline-flex px-2 py-1 rounded-full text-xs font-medium",
      color === 'amber' ? 'bg-amber-100 text-amber-800' : 
      color === 'green' ? 'bg-green-100 text-green-800' : 
      color === 'blue' ? 'bg-blue-100 text-blue-800' : 
      color === 'red' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    )
  },
  actions: {
    container: "flex items-center justify-center",
    button: "h-8 w-8",
    icon: "h-4 w-4 text-gray-500"
  },
  expandedContent: {
    container: "sticky left-0 right-0 bg-muted/50 expanded-content-div shadow-[inset_0px_2px_4px_oklch(20.99130133%_0.034134981_263.4360409_/_0.06),inset_0px_4px_8px_oklch(20.99130133%_0.034134981_263.4360409_/_0.1)]",
    grid: "grid grid-cols-3 gap-4 p-4",
    section: "space-y-1 text-sm",
    heading: "font-medium mb-2"
  }
} as const

// The special column IDs that should maintain fixed width based on their header content
const FIXED_WIDTH_COLUMNS = ['select', 'expander', 'actions', 'details', 'bio'];

// Helper function to check if a column should have fixed width
function isFixedWidthColumn(colId: string): boolean {
  if (!colId) return false;
  
  const normalizedId = colId.toLowerCase();
  
  // Direct matching first
  for (const fixedId of FIXED_WIDTH_COLUMNS) {
    // Exact match
    if (normalizedId === fixedId) return true;
    
    // ID contains the fixed pattern (e.g., "userBio" matches "bio")
    if (normalizedId.includes(fixedId)) return true;
    
    // Handle common prefix/suffix patterns
    if (normalizedId.endsWith(`_${fixedId}`) || 
        normalizedId.startsWith(`${fixedId}_`) ||
        normalizedId.includes(`_${fixedId}_`)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to get the appropriate styles for a column based on its ID
function getColumnStyle(colId: string) {
  if (!colId) return {};
  
  const normalizedId = colId.toLowerCase();
  
  // For checkbox column (select), ensure proper padding
  if (normalizedId === 'select' || normalizedId.includes('checkbox')) {
    return {
      className: "text-center !pr-3 !pl-3 !py-2", // Force all padding with !important
      width: 56,
      minWidth: 56
    };
  }
  
  // For action columns, ensure proper width
  if (normalizedId === 'actions' || normalizedId.includes('action')) {
    return {
      className: "text-center",
      width: 60,
      minWidth: 60
    };
  }
  
  // For expander columns
  if (normalizedId === 'expander' || normalizedId.includes('expand')) {
    return {
      className: "text-center",
      width: 56,
      minWidth: 56
    };
  }
  
  return {};
}

// Helper function to check if a column header renders a button or complex UI element
function hasComplexHeaderContent(column: any): boolean {
  // Check if the header is a function that likely renders a complex UI
  if (typeof column.header === 'function') {
    return true;
  }
  
  // Check for specific column types that typically have complex headers
  if (column.id) {
    const id = column.id.toLowerCase();
    return id.includes('select') || id.includes('expander') || id.includes('action');
  }
  
  return false;
}

// Add this function to measure header content width
function useHeaderContentWidths() {
  const [headerWidths, setHeaderWidths] = React.useState<Record<string, number>>({});
  const headerRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const [measuredOnce, setMeasuredOnce] = React.useState(false);
  
  // Register a ref for a header
  const registerHeaderRef = React.useCallback((id: string, element: HTMLElement | null) => {
    headerRefs.current[id] = element;
  }, []);
  
  // Measure all headers after they have been fully rendered
  React.useEffect(() => {
    if (measuredOnce || Object.keys(headerRefs.current).length === 0) return;
    
    const newWidths: Record<string, number> = {};
    
    // Simplified and fast text width estimation
    const measureTextContent = (element: HTMLElement): number => {
      // Use element's natural scrollWidth as a fast approximation
      const naturalWidth = element.scrollWidth;
      if (naturalWidth > 0) return naturalWidth;
      
      // Fallback: estimate based on character count (average 7px per character)
      const textContent = element.textContent || '';
      return Math.max(60, textContent.length * 7); // Minimum 60px width
    };
    
    // Use requestAnimationFrame for efficient header width measurement
    const animationId = requestAnimationFrame(() => {
      Object.entries(headerRefs.current).forEach(([id, element]) => {
        if (element) {
          try {
            // Simplified measurement using element's natural width
            const textWidth = measureTextContent(element);
            
            // Add space for sort icon and minimal buffer (reduced calculation complexity)
            const sortIconWidth = 20;
            const buffer = 8;
            const totalWidth = textWidth + sortIconWidth + buffer;
            
            // Store the width
            newWidths[id] = Math.ceil(totalWidth);
            
          } catch (e) {
            // Simple fallback using scrollWidth
            const width = element.scrollWidth + 28; // Add space for sort icon
            newWidths[id] = Math.ceil(width);
          }
        }
      });
      
      setHeaderWidths(newWidths);
      setMeasuredOnce(true);
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [headerRefs.current, measuredOnce]);
  
  return { headerWidths, registerHeaderRef };
}

// Helper function to wrap existing cell content in specific columns
function wrapCellContent(content: React.ReactNode, columnId: string | undefined): React.ReactNode {
  if (!columnId) return content;
  
  const normalizedId = columnId.toLowerCase();
  
  // For checkbox/select columns, wrap in centered container
  if (normalizedId === 'select' || normalizedId.includes('checkbox')) {
    return (
      <div className="flex items-center justify-center w-full h-full min-w-[40px]">
        {content}
      </div>
    );
  }
  
  // For action columns, center content and update Button variant if possible
  if (normalizedId === 'actions' || normalizedId.includes('action')) {
    return (
      <div className="flex items-center justify-center w-full">
        {content}
      </div>
    );
  }
  
  // For expander columns, content as is - buttons are directly styled in columns
  if (normalizedId === 'expander' || normalizedId.includes('expand')) {
    return content;
  }
  
  return content;
}

// Helper function to wrap cell content with row notification indicators
function wrapCellContentWithNotification<TData>(
  content: React.ReactNode, 
  columnId: string | undefined, 
  row: any, 
  visualRowIndex: number,
  getRowNotification?: (row: TData, index: number) => boolean
): React.ReactNode {
  // First apply the standard cell content wrapping
  const wrappedContent = wrapCellContent(content, columnId);
  
  // Check if this is a name column and should show notification
  if (columnId && getRowNotification) {
    const normalizedId = columnId.toLowerCase();
    const shouldShowNotification = getRowNotification(row.original, visualRowIndex);
    
    // Check if this is a name column (common patterns)
    if ((normalizedId.includes('name') || normalizedId.includes('user') || normalizedId.includes('title')) && shouldShowNotification) {
      return (
        <div className="flex items-center w-full min-w-0">
          <div className="flex-1 min-w-0 pr-2">
            {/* Ensure the content is wrapped in a truncation container */}
            <div className="truncate w-full">
              {wrappedContent}
            </div>
          </div>
          <div className="flex-shrink-0 w-4 flex justify-center">
            <NotificationIndicator 
              show={true}
              delay={visualRowIndex * 0.15} // 150ms stagger between rows from top to bottom
              variant="row"
            />
          </div>
        </div>
      );
    }
  }
  
  return wrappedContent;
}

// Helper function to wrap header content with appropriate styling
function wrapHeaderContent(content: React.ReactNode, column: any, registerHeaderRef: (id: string, el: HTMLElement | null) => void): React.ReactNode {
  const columnId = column.id;
  
  // Don't add click handlers for non-sortable columns
  if (!columnId || !column.getCanSort()) {
    return wrapCellContent(content, columnId);
  }
  
  // For sortable columns, add the click handler and styling
  return (
    <div 
      className={tableStyles.headerContent}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      ref={(el) => {
        if (el) registerHeaderRef(columnId, el);
      }}
    >
      <span className="header-text truncate mr-2">{content}</span>
      {column.getIsSorted() && (
        <span className="ml-1 flex-shrink-0">
          {column.getIsSorted() === "asc" ? (
            <ArrowUpNarrowWide className="h-4 w-4" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" />
          )}
        </span>
      )}
    </div>
  );
}

// Helper function to check if a column should have sorting disabled
function shouldDisableSorting(colId: string): boolean {
  if (!colId) return true;
  
  const normalizedId = colId.toLowerCase();
  
  // Disable sorting for these special columns
  return normalizedId === 'select' || 
         normalizedId.includes('checkbox') || 
         normalizedId === 'expander' || 
         normalizedId.includes('expand') || 
         normalizedId === 'actions' || 
         normalizedId.includes('action');
}

// Process columns to add tertiary button variants for expander and actions
function processColumnButtons<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return columns.map(column => {
    const colId = column.id || ('accessorKey' in column ? String(column.accessorKey) : undefined);
    
    // Skip if no ID
    if (!colId) return column;
    
    const normalizedId = colId.toLowerCase();
    
    // Process expander columns to add tertiary variant to buttons
    if (normalizedId === 'expander' || normalizedId.includes('expand')) {
      // Only modify if cell function exists
      if (column.cell && typeof column.cell === 'function') {
        // Create a wrapper for the original cell renderer
        const originalCell = column.cell;
        
        // Wrap with our own function that provides tertiary variant to buttons
        const wrappedCell = (props: any) => {
          // Return a custom component that renders the button with tertiary variant
          return (
            <div className="flex h-full w-full items-center justify-center">
              <Button 
                variant="tertiary"
                size="icon"
                className="h-6 w-6 flex items-center justify-center"
                onClick={() => props.row.toggleExpanded()}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", {
                  "transform -rotate-90": !props.row.getIsExpanded(),
                })} />
              </Button>
            </div>
          );
        };
        
        // Return a modified column with the wrapped cell
        return {
          ...column,
          cell: wrappedCell
        };
      }
    }
    
    // Process actions columns to add tertiary variant to buttons
    if (normalizedId === 'actions' || normalizedId.includes('action')) {
      // Return the original column and don't try to process it - this allows custom actions to be rendered
      // as designed in each table component
      return column;
    }
    
    // Return original column for non-action/non-expander columns
    return column;
  });
}

// Define ActionItem interface for reusable actions
export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: (row: any) => void;
}

/**
 * Creates a consistent actions column with dropdown menu
 * 
 * @param actions Array of action items to display in the dropdown
 * @param options Configuration options for the actions column
 * @returns ColumnDef for an actions column
 */
export function createActionsColumn<TData>(
  actions: ActionItem[],
  options?: {
    header?: string;
    size?: number;
    useVerticalIcon?: boolean;
    buttonVariant?: "default" | "tertiary" | "ghost";
  }
): ColumnDef<TData> {
  const {
    header = "Actions",
    size = 60,
    useVerticalIcon = false,
    buttonVariant = "tertiary",
  } = options || {};

  const IconComponent = useVerticalIcon ? MoreVertical : MoreHorizontal;

  return {
    id: "actions",
    header,
    enablePinning: true,
    size,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={buttonVariant} size="icon" className="h-8 w-8">
              <IconComponent className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem 
                  key={index}
                  onClick={() => action.onClick(row.original)}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };
}

/**
 * Generate filter options from column definitions
 */
function generateFilterOptionsFromColumns<TData>(
  columns: ColumnDef<TData>[],
  excludeColumns: string[] = ['select', 'expander', 'name', 'actions']
) {
  const filterOptions: {
    id: string;
    label: string;
    field: string;
    options?: { label: string; value: string }[];
  }[] = [];

  // Process each column
  columns.forEach(column => {
    // Get column ID
    const colId = column.id || ('accessorKey' in column ? String(column.accessorKey) : undefined);
    
    // Skip if no ID or if it's in the exclude list
    if (!colId || excludeColumns.some(exclude => 
      colId.toLowerCase() === exclude.toLowerCase() || 
      colId.toLowerCase().includes(exclude.toLowerCase())
    )) {
      return;
    }
    
    // Get human-readable label
    let label = colId;
    
    // Try to convert camelCase or snake_case to Title Case
    if (label.includes('_')) {
      // Convert snake_case to Title Case
      label = label.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else {
      // Convert camelCase to Title Case
      label = label
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    }
    
    // Add to filter options
    filterOptions.push({
      id: colId,
      label: label.trim(),
      field: 'accessorKey' in column ? String(column.accessorKey) : colId,
    });
  });
  
  return filterOptions;
}

/**
 * FilterDropdown - A searchable filter dropdown component
 */
function FilterDropdown({
  filterOptions,
  onFilterSelect,
  filterCount = 0,
}: {
  filterOptions: {
    id: string
    label: string
    field: string
    options?: {
      label: string
      value: string
    }[]
  }[];
  onFilterSelect: (filterId: string, field: string, value: string, displayLabel?: string) => void;
  filterCount?: number;
}) {
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedField, setSelectedField] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  
  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return filterOptions;
    
    const lowerSearch = searchValue.toLowerCase();
    return filterOptions.filter(option => 
      option.label.toLowerCase().includes(lowerSearch) ||
      option.field.toLowerCase().includes(lowerSearch)
    );
  }, [filterOptions, searchValue]);
  
  // Get selected field details
  const selectedFieldDetails = React.useMemo(() => {
    if (!selectedField) return null;
    return filterOptions.find(option => option.id === selectedField);
  }, [filterOptions, selectedField]);
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" className="flex items-center gap-2 h-10 px-4">
          <div className="flex items-center">
            <ListFilterPlus className="h-4 w-4 mr-2" />
            Add Filter
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {!selectedField ? (
          <>
            <div className="px-2 py-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search fields..."
                  className="w-full"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No fields found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {filteredOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="flex items-center gap-2 p-2"
                    onClick={() => {
                      // If field has options, show option selector
                      if (option.options && option.options.length > 0) {
                        setSelectedField(option.id);
                      } else {
                        // If no options, add filter directly and close the dropdown
                        onFilterSelect(option.id, option.field, "", option.label);
                        // Let the dropdown close naturally
                      }
                    }}
                  >
                    {option.label}
                    {option.options && option.options.length > 0 && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </>
        ) : selectedFieldDetails ? (
          <>
            <div className="flex items-center p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={(e) => {
                  e.preventDefault(); // Prevent dropdown from closing
                  setSelectedField(null);
                  setSearchValue("");
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <DropdownMenuLabel className="flex-1 text-center">
                {selectedFieldDetails.label}
              </DropdownMenuLabel>
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search values..."
                  className="w-full"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {selectedFieldDetails.options && selectedFieldDetails.options.length > 0 ? (
                selectedFieldDetails.options
                  .filter(option => {
                    if (!searchValue) return true;
                    return option.label.toLowerCase().includes(searchValue.toLowerCase());
                  })
                  .map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex items-center gap-2 p-2"
                      onClick={() => {
                        onFilterSelect(
                          selectedFieldDetails.id, 
                          selectedFieldDetails.field, 
                          option.value,
                          selectedFieldDetails.label
                        );
                        setSelectedField(null);
                        setSearchValue("");
                        // Let the dropdown close naturally here when a value is finally selected
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No values available
                </div>
              )}
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for virtual scrolling calculations
function useVirtualScrolling<TData>({
  rows,
  containerRef,
  enabled = false,
  rowHeight = 48,
  maxHeight = 400,
  overscan = 5,
  threshold = 100
}: {
  rows: Row<TData>[]
  containerRef: React.RefObject<HTMLDivElement | null>
  enabled?: boolean
  rowHeight?: number
  maxHeight?: number
  overscan?: number
  threshold?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  // Only virtualize if enabled and we have enough rows
  const shouldVirtualize = enabled && rows.length >= threshold
  
  // Calculate visible range
  const { startIndex, endIndex, visibleHeight, paddingTop, paddingBottom } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: rows.length,
        visibleHeight: Math.min(rows.length * rowHeight, maxHeight),
        paddingTop: 0,
        paddingBottom: 0
      }
    }
    
    const containerHeight = maxHeight
    const visibleRowCount = Math.ceil(containerHeight / rowHeight)
    
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(rows.length, start + visibleRowCount + overscan * 2)
    
    const totalHeight = rows.length * rowHeight
    const actualHeight = Math.min(totalHeight, maxHeight)
    
    return {
      startIndex: start,
      endIndex: end,
      visibleHeight: actualHeight,
      paddingTop: start * rowHeight,
      paddingBottom: Math.max(0, (rows.length - end) * rowHeight)
    }
  }, [shouldVirtualize, rows.length, scrollTop, rowHeight, maxHeight, overscan])
  
  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  return {
    shouldVirtualize,
    startIndex,
    endIndex,
    visibleHeight,
    paddingTop,
    paddingBottom,
    handleScroll
  }
}

export function AdvancedPinnedTable<TData>({
  data,
  columns,
  isLoading = false,
  defaultPinnedColumns = { left: [], right: [] },
  defaultSorting = [],
  defaultPagination = { pageIndex: 0, pageSize: 10 },
  onSortingChange,
  onPaginationChange,
  onRowSelectionChange,
  onExpandedChange,
  onColumnVisibilityChange,
  onColumnPinningChange,
  isRightSidebarOpen = true,
  renderExpandedContent,
  expandedViewType = "default",
  bulkActions = [],
  enableTwoStepBulkActions = false,
  processButtonText = "Process",
  hideCancelButton = false,
  enableSearch = false,
  searchPlaceholder = "Search...",
  searchFunction,
  initialSearchValue = "",
  enableStatusFilter = false,
  statusFilters = [],
  hideAllTab = false,
  initialSelectedStatusFilter,
  enableFilters = false,
  filterOptions = [],
  autoGenerateFilters = true,
  tabsClassName,
  tabStyles = {
    activeVariant: "secondary",
    inactiveVariant: "tertiary",
    size: "md"
  },
  getRowNotification,
  virtualScrolling,
}: AdvancedPinnedTableProps<TData>) {
  // Use the hook to measure header content widths
  const { headerWidths, registerHeaderRef } = useHeaderContentWidths();

  // Add search state
  const [searchValue, setSearchValue] = React.useState(initialSearchValue);
  
  // Add filter states - set initial filter based on prop, hideAllTab, or default
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>(
    initialSelectedStatusFilter || 
    (hideAllTab && statusFilters.length > 0 ? statusFilters[0]!.id : "all")
  );
  const [activeFilters, setActiveFilters] = React.useState<{
    id: string;
    field: string;
    value: string;
    displayLabel?: string;
  }[]>([]);

  // Add bulk action selection state
  const [selectedBulkAction, setSelectedBulkAction] = React.useState<{
    label: string;
    onClick: (selectedRows: Row<TData>[]) => void;
  } | null>(null);
  
  // Add dropdown open state for controlled dropdown
  const [bulkActionsDropdownOpen, setBulkActionsDropdownOpen] = React.useState(false);

  // Process columns to add sorting functionality
  const processedColumns = React.useMemo(() => {
    return columns.map(column => {
      // Special handling for checkbox/select columns
      if (column.id === 'select' || (typeof column.id === 'string' && column.id.toLowerCase().includes('checkbox'))) {
        // Preserve original column properties but ensure consistent width
        const columnStyle = getColumnStyle(column.id);
        return {
          ...column,
          size: columnStyle.width || column.size || 56,
          minSize: columnStyle.minWidth || 56,
          maxSize: 70, // Prevent checkbox columns from getting too wide
          enableSorting: false // Explicitly disable sorting
        };
      }

      // For special columns that shouldn't have sorting
      const colId = column.id || (('accessorKey' in column) ? String(column.accessorKey) : undefined);
      if (colId && shouldDisableSorting(colId)) {
        return {
          ...column,
          enableSorting: false // Explicitly disable sorting
        };
      }
      
      // Only modify data columns that don't have special handling
      const accessorKey = 'accessorKey' in column ? column.accessorKey : undefined;
      if (accessorKey && column.enableSorting !== false) {
        const colId = column.id || String(accessorKey);
        
        // For text-based columns, ensure ID is defined and sorting is enabled
        return {
          ...column,
          id: colId, // Ensure ID is always defined
          enableSorting: true, // Enable sorting by default
        };
      }
      
      // Return original column for all other cases
      return column;
    });
  }, [columns]) as ColumnDef<TData>[];

  // Create a default search function if none provided
  const defaultSearchFunction = React.useCallback(
    (row: TData, query: string) => {
      if (!query) return true;
      const lowerQuery = query.toLowerCase();
      
      // Check each column for a match
      return columns.some(column => {
        // Skip columns that don't have accessorKey
        if (!('accessorKey' in column)) return false;
        
        const accessorKey = column.accessorKey as keyof TData;
        const value = row[accessorKey];
        
        if (value == null) return false;
        
        // Convert value to string and check if it includes the query
        return String(value).toLowerCase().includes(lowerQuery);
      });
    },
    [columns]
  );

  // Filter data based on search and filters
  const filteredData = React.useMemo(() => {
    // Start with all data
    let filtered = [...data];
    
    // Apply search
    if (searchValue) {
      const searchFn = searchFunction || defaultSearchFunction;
      filtered = filtered.filter(row => searchFn(row, searchValue));
    }
    
    // Apply status filter
    if (enableStatusFilter && selectedStatusFilter !== "all" && statusFilters.length > 0) {
      const activeStatusFilter = statusFilters.find(f => f.id === selectedStatusFilter);
      if (activeStatusFilter) {
        filtered = filtered.filter(row => {
          const fieldValue = row[activeStatusFilter.field as keyof TData];
          // Handle status objects that have a text property
          if (fieldValue && typeof fieldValue === 'object' && 'text' in fieldValue) {
            return fieldValue.text === activeStatusFilter.value;
          }
          // Handle simple values
          return String(fieldValue) === activeStatusFilter.value;
        });
      }
    } else if (hideAllTab && enableStatusFilter && selectedStatusFilter && statusFilters.length > 0) {
      // When "All" tab is hidden, always apply the selected filter
      const activeStatusFilter = statusFilters.find(f => f.id === selectedStatusFilter);
      if (activeStatusFilter) {
        filtered = filtered.filter(row => {
          const fieldValue = row[activeStatusFilter.field as keyof TData];
          // Handle status objects that have a text property
          if (fieldValue && typeof fieldValue === 'object' && 'text' in fieldValue) {
            return fieldValue.text === activeStatusFilter.value;
          }
          // Handle simple values
          return String(fieldValue) === activeStatusFilter.value;
        });
      }
    }
    
    // Apply other filters
    if (enableFilters && activeFilters.length > 0) {
      filtered = filtered.filter(row => 
        activeFilters.every(filter => {
          const fieldValue = row[filter.field as keyof TData];
          // Handle objects with text property
          if (fieldValue && typeof fieldValue === 'object' && 'text' in fieldValue) {
            return fieldValue.text === filter.value;
          }
          // Handle regular values
          return String(fieldValue).toLowerCase() === filter.value.toLowerCase();
        })
      );
    }
    
    return filtered;
  }, [data, searchValue, enableStatusFilter, selectedStatusFilter, statusFilters, enableFilters, activeFilters, searchFunction, defaultSearchFunction]);

  // Replace data with filteredData in the table initialization
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting)
  const [pagination, setPagination] = React.useState<PaginationState>(defaultPagination)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(defaultPinnedColumns)
  const tableRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  // Track the previous width to detect sidebar changes - moved outside useEffect
  const prevWidthRef = React.useRef<number>(containerWidth);

  // Handle external state changes
  React.useEffect(() => {
    if (onSortingChange) onSortingChange(sorting)
  }, [sorting, onSortingChange])

  React.useEffect(() => {
    if (onPaginationChange) onPaginationChange(pagination)
  }, [pagination, onPaginationChange])

  React.useEffect(() => {
    if (onRowSelectionChange) onRowSelectionChange(rowSelection)
  }, [rowSelection, onRowSelectionChange])

  React.useEffect(() => {
    if (onExpandedChange) onExpandedChange(expanded)
  }, [expanded, onExpandedChange])

  React.useEffect(() => {
    if (onColumnVisibilityChange) onColumnVisibilityChange(columnVisibility)
  }, [columnVisibility, onColumnVisibilityChange])

  React.useEffect(() => {
    if (onColumnPinningChange) onColumnPinningChange(columnPinning)
  }, [columnPinning, onColumnPinningChange])



  // Improve the ResizeObserver implementation with sidebar awareness
  React.useEffect(() => {
    if (!tableRef.current) return

    // Find the table container element
    const tableContainer = tableRef.current.querySelector('div[data-slot="table-container"]') || 
                           tableRef.current.closest('div[data-slot="table-container"]') || 
                           tableRef.current;
    
    // Update width function to handle sidebar transitions
    const updateWidth = (width: number) => {
      if (width <= 0) return;
      
      // Only update if width changed significantly (more than 5px) or is the first set
      const significantChange = Math.abs(width - containerWidth) > 5;
      const isFirstSet = containerWidth === 0;
      
      if (significantChange || isFirstSet) {
        // Table container width updated
        
        // Store previous width for transition detection
        prevWidthRef.current = containerWidth;
        
        // Update the state with new width
        setContainerWidth(width);
        
        // Apply the width to all expanded content divs - IMMEDIATELY WITHOUT TRANSITION
        const expandedDivs = tableRef.current?.querySelectorAll('.expanded-content-div');
        expandedDivs?.forEach(div => {
          // Always update width immediately to match window/sidebar changes
          const el = div as HTMLElement;
          el.style.transition = 'none';
          el.style.width = `${width}px`;
          
          // Force a reflow to ensure the width is applied immediately
          void el.offsetWidth;
        });
      }
    };
    
    // Create a resize observer to track width changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Get the width from the entry
        const width = entry.contentRect.width;
        updateWidth(width);
      }
    });

    // Check the initial right sidebar state and apply width immediately
    if (tableContainer) {
      // Start observing
      resizeObserver.observe(tableContainer);
      
      // Set initial width immediately, based on current sidebar state
      if (tableContainer.clientWidth && tableContainer.clientWidth > 0) {
        // Use the actual width that reflects the current sidebar state
        updateWidth(tableContainer.clientWidth);
      }
    }

    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [isRightSidebarOpen, containerWidth]); // Re-run when sidebar state changes

  // After the existing useEffect for container width changes, add a new effect for expanded state changes
  React.useEffect(() => {
    // Skip if there's no container width or table ref
    if (containerWidth <= 0 || !tableRef.current) return
    
    // Set width for any expanded content divs
    const expandedDivs = tableRef.current.querySelectorAll('.expanded-content-div')
    if (expandedDivs.length > 0) {
      // Apply width to all expanded divs immediately
      expandedDivs.forEach(div => {
        const el = div as HTMLElement;
        el.style.transition = 'none';
        el.style.width = `${containerWidth}px`;
        
        // Force a reflow to ensure the width is applied immediately
        void el.offsetWidth;
      })
    }
  }, [expanded, containerWidth]) // Re-run when expanded state or container width changes

  // Add another effect to ensure expanded content width after component mounts and data loads
  React.useEffect(() => {
    // Skip if component isn't mounted yet
    if (!tableRef.current || containerWidth <= 0) return;
    
    // Apply immediate width updates when data changes
    const expandedDivs = tableRef.current?.querySelectorAll('.expanded-content-div');
    if (expandedDivs?.length) {
      expandedDivs.forEach(div => {
        const el = div as HTMLElement;
        el.style.transition = 'none';
        el.style.width = `${containerWidth}px`;
        
        // Force a reflow to ensure the width is applied immediately
        void el.offsetWidth;
      });
              // Set width on expanded content divs
    }
  }, [data, containerWidth]); // Run when data or container width changes

  // Add effect to respond specifically to right sidebar state changes
  React.useEffect(() => {
    if (!tableRef.current || containerWidth <= 0) return;
    
    // When right sidebar state changes, ensure expanded content adjusts accordingly
    // This is a backup to ensure immediate width updates even if ResizeObserver misses something
    const timerId = setTimeout(() => {
      // Store the current ref value to avoid null checks throughout
      const currentRef = tableRef.current;
      if (!currentRef) return;
      
      const tableContainer = currentRef.querySelector('div[data-slot="table-container"]') || 
                             currentRef.closest('div[data-slot="table-container"]');
      
      if (tableContainer && tableContainer.clientWidth > 0) {
        const newWidth = tableContainer.clientWidth;
        
        // Apply width immediately without transition
        const expandedDivs = currentRef.querySelectorAll('.expanded-content-div');
        expandedDivs.forEach((div) => {
          const el = div as HTMLElement;
          el.style.transition = 'none';
          el.style.width = `${newWidth}px`;
          
          // Force a reflow to ensure the width is applied immediately
          void el.offsetWidth;
        });
        
        // Update container width if it differs from current measurement
        if (Math.abs(newWidth - containerWidth) > 5) {
          setContainerWidth(newWidth);
        }
      }
    }, 0); // Use immediate timeout to apply changes as soon as possible
    
    return () => clearTimeout(timerId);
  }, [isRightSidebarOpen, containerWidth]); // Re-run when sidebar state changes or container width changes

  // Adjust column sizes to fit container width if needed
  const adjustColumnSizes = React.useCallback(() => {
    if (containerWidth <= 0) return columns
    
    // Separate fixed-width columns from resizable ones
    const fixedWidthColumns: typeof columns = []
    const resizableColumns: typeof columns = []
    
    columns.forEach(col => {
      const colId = typeof col.id === 'string' ? col.id : 
                  'accessorKey' in col ? String(col.accessorKey) : 
                  `col-${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if this is a fixed-width column
      const isFixedWidth = isFixedWidthColumn(colId);
      
      // Special handling for checkbox/select columns
      const isCheckboxColumn = colId === 'select' || 
                             (typeof colId === 'string' && 
                              (colId.toLowerCase().includes('checkbox') || 
                               colId.toLowerCase().includes('select')));
      
      // Get measured width from header if available
      const measuredWidth = headerWidths[colId];
      
      if (isCheckboxColumn) {
        // For checkbox columns, use fixed width with explicit min/max constraints
        fixedWidthColumns.push({
          ...col,
          size: 56,
          minSize: 56,
          maxSize: 56 // Set max size to be the same as min/size to prevent resizing
        });
      } else if (isFixedWidth) {
        // For fixed width columns, use the larger of the measured width or specified size
        if (measuredWidth) {
          // Always ensure the column is at least as wide as its content
          const adjustedSize = Math.max(measuredWidth, col.size || 0);
          fixedWidthColumns.push({
            ...col,
            size: adjustedSize,
            minSize: measuredWidth // Ensure it can't be resized smaller than the text
          });
        } else {
          fixedWidthColumns.push(col);
        }
      } else {
        // For resizable columns, ensure they meet minimum width requirements
        if (measuredWidth) {
          // Ensure column never gets smaller than text width
          resizableColumns.push({
            ...col,
            minSize: measuredWidth, // Set minSize to ensure text fits
            size: Math.max(measuredWidth, col.size || 150)
          });
        } else {
          resizableColumns.push(col);
        }
      }
    });
    
    // Calculate total width of fixed columns
    const fixedColumnsWidth = fixedWidthColumns.reduce((acc, col) => {
      return acc + (col.size || 150) // Default column size if not specified
    }, 0)
    
    // Calculate total width of resizable columns
    const resizableColumnsWidth = resizableColumns.reduce((acc, col) => {
      return acc + (col.size || 150) // Default column size if not specified
    }, 0)
    
    // Calculate remaining width for resizable columns
    const remainingWidth = containerWidth - fixedColumnsWidth - 20 // 20px buffer for safety
    
    if (remainingWidth > resizableColumnsWidth && resizableColumns.length > 0) {
      // Calculate expansion ratio for resizable columns
      const expansionRatio = remainingWidth / resizableColumnsWidth
      
      // Adjust only resizable columns
      const adjustedResizableColumns = resizableColumns.map(col => {
        const baseSize = col.size || 150;
        const minSize = col.minSize || 0;
        
        // Calculate new size based on ratio, but respect minimum size
        // Cap expansion ratio at 1.5 to avoid too wide columns
        const cappedRatio = Math.min(expansionRatio, 1.5);
        const newSize = Math.max(Math.floor(baseSize * cappedRatio), minSize);
        
        return {
          ...col,
          size: newSize,
          minSize // Preserve the minimum size
        };
      })
      
      // Combine fixed and adjusted resizable columns
      return [
        ...fixedWidthColumns,
        ...adjustedResizableColumns
      ].sort((a, b) => {
        // Sort them back to their original order
        const aIndex = columns.findIndex(col => col.id === a.id)
        const bIndex = columns.findIndex(col => col.id === b.id)
        return aIndex - bIndex
      })
    }
    
    // If no adjustment needed, return columns with minWidth constraints
    return columns.map(col => {
      const colId = typeof col.id === 'string' ? col.id : 
                  'accessorKey' in col ? String(col.accessorKey) : 
                  undefined;
      
      // If we have a measured width and column ID, ensure minSize constraint
      if (colId && headerWidths[colId]) {
        return {
          ...col,
          minSize: headerWidths[colId],
          size: Math.max(headerWidths[colId], col.size || 150)
        };
      }
      
      return col;
    });
  }, [columns, containerWidth, headerWidths])

  // Use this processor to apply secondary buttons to columns
  const finalColumns = React.useMemo(() => {
    // First adjust column sizes
    const sizeAdjustedColumns = containerWidth > 0 ? adjustColumnSizes() : processedColumns;
    
    // Then apply button variants
    return processColumnButtons<TData>(sizeAdjustedColumns);
  }, [processedColumns, containerWidth, adjustColumnSizes]);

  // Generate filter options from columns if autoGenerateFilters is true
  const combinedFilterOptions = React.useMemo(() => {
    if (!autoGenerateFilters) return filterOptions;
    
    // Generate options from columns
    const columnFilterOptions = generateFilterOptionsFromColumns(columns);
    
    // Combine with provided filter options, removing duplicates
    const combinedOptions = [...filterOptions];
    
    // Add column-generated options that don't already exist
    columnFilterOptions.forEach(option => {
      if (!combinedOptions.some(existingOption => existingOption.id === option.id)) {
        combinedOptions.push(option);
      }
    });
    
    return combinedOptions;
  }, [columns, filterOptions, autoGenerateFilters]);

  // Create the table with filtered data
  const table = useReactTable({
    data: filteredData, // Use filteredData instead of data
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableExpanding: true,
    enableSorting: true,
    state: {
      sorting,
      pagination,
      columnPinning,
      expanded,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  })

  // Clear selected bulk action when no rows are selected
  React.useEffect(() => {
    if (table.getFilteredSelectedRowModel().rows.length === 0) {
      setSelectedBulkAction(null);
    }
  }, [rowSelection, table.getFilteredSelectedRowModel().rows.length])

  // Determine the minimum width required for the table
  const minTableWidth = Math.max(containerWidth, table.getTotalSize())

  // Virtual scrolling setup
  const tableBodyRef = useRef<HTMLDivElement>(null)
  const virtualConfig = virtualScrolling || {}
  const {
    enabled: virtualEnabled = false,
    rowHeight: virtualRowHeight = 48,
    maxHeight: virtualMaxHeight = 400,
    overscan: virtualOverscan = 5,
    threshold: virtualThreshold = 100
  } = virtualConfig

  const {
    shouldVirtualize,
    startIndex,
    endIndex,
    visibleHeight,
    paddingTop,
    paddingBottom,
    handleScroll
  } = useVirtualScrolling({
    rows: table.getRowModel().rows,
    containerRef: tableBodyRef,
    enabled: virtualEnabled,
    rowHeight: virtualRowHeight,
    maxHeight: virtualMaxHeight,
    overscan: virtualOverscan,
    threshold: virtualThreshold
  })

  // Function to add a new filter
  const addFilter = (filterId: string, field: string, value: string, displayLabel?: string) => {
    // Check if this is a status filter by checking filterId against status filters
    const isStatusFilter = statusFilters.some(filter => 
      filter.id === filterId || 
      filter.field === field ||
      field.startsWith('status.')
    );
    
    // Handle potential undefined values safely
    let firstPart = '';
    if (field && field.includes('.')) {
      const parts = field.split('.');
      if (parts.length > 0 && parts[0]) {
        firstPart = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    } else if (field) {
      firstPart = field.charAt(0).toUpperCase() + field.slice(1);
    }
    
    const finalDisplayLabel = isStatusFilter 
      ? "Status" 
      : (displayLabel || firstPart || field || 'Filter');
    
    setActiveFilters(prev => {
      // Check if filter already exists
      const exists = prev.some(f => f.id === filterId);
      
      if (exists) {
        // Update existing filter
        return prev.map(f => f.id === filterId ? { 
          id: filterId, 
          field, 
          value,
          displayLabel: finalDisplayLabel
        } : f);
      } else {
        // Add new filter
        return [...prev, { 
          id: filterId, 
          field, 
          value,
          displayLabel: finalDisplayLabel
        }];
      }
    });
  };

  // Function to remove a filter
  const removeFilter = (filterId: string) => {
    // First, check if the filter being removed is associated with a status tab
    const isStatusFilter = statusFilters.some(filter => filter.id === filterId);
    
    // If removing a filter by field, also check if it's a status field
    let isStatusFieldFilter = false;
    if (!isStatusFilter && statusFilters.length > 0) {
      const filter = activeFilters.find(f => f.id === filterId);
      if (filter && statusFilters.some(sf => sf.field === filter.field)) {
        isStatusFieldFilter = true;
      }
    }
    
    // Remove the filter
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    
    // If it's a status filter, reset the tab to "all"
    if (isStatusFilter || isStatusFieldFilter) {
      setSelectedStatusFilter("all");
    }
  };

  // Function to clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSelectedStatusFilter("all");
  };

  // Create a component reference for the expanded view
  const ExpandedViewComponent = React.useMemo(() => {
    // If custom render function is provided, use that
    if (renderExpandedContent) {
      return ({ row }: BaseExpandedViewProps<TData>) => renderExpandedContent({ row });
    }
    
    // Otherwise use our template system
    return getExpandedView(expandedViewType);
  }, [renderExpandedContent, expandedViewType]);

  // Show skeleton if loading
  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Search and filter UI - moved outside the table container */}
      {(enableSearch || enableStatusFilter || enableFilters) && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-grow">
              {/* Search input */}
              {enableSearch && (
                <div className="relative w-full max-w-[300px]">
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full h-10"
                    startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                  />
                </div>
              )}
              
              {/* Applied filters badge */}
              {enableFilters && activeFilters.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="h-8 pl-3 pr-1 flex items-center gap-2 border-slate-300 text-slate-700 rounded-md"
                >
                  {activeFilters.length} {activeFilters.length === 1 ? 'filter' : 'filters'} applied
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-5 w-5 p-0 rounded-sm bg-slate-200 hover:bg-slate-300"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
            
            {/* Filter dropdown */}
            {enableFilters && combinedFilterOptions.length > 0 && (
              <FilterDropdown 
                filterOptions={combinedFilterOptions}
                onFilterSelect={(filterId, field, value, displayLabel) => addFilter(filterId, field, value, displayLabel)}
                filterCount={activeFilters.length}
              />
            )}
          </div>
          
          {/* Status tabs */}
          {enableStatusFilter && statusFilters.length > 0 && (
            <div className="mt-4">
              <Tabs value={selectedStatusFilter} onValueChange={(value) => {
                setSelectedStatusFilter(value);
                
                // Update activeFilters based on selected tab
                if (value !== "all") {
                  const selectedFilter = statusFilters.find(f => f.id === value);
                  if (selectedFilter) {
                    // Ensure field and value are defined
                    const safeField = selectedFilter.field || '';
                    const safeValue = selectedFilter.value || '';
                    const safeId = selectedFilter.id || value;
                    
                    // Check if this filter already exists
                    const filterExists = activeFilters.some(f => f.field === safeField);
                    
                    if (filterExists) {
                      // Update existing filter with explicit "Status" label
                      setActiveFilters(prev => 
                        prev.map(f => f.field === safeField ? 
                          { 
                            id: safeId, 
                            field: safeField, 
                            value: safeValue, 
                            displayLabel: "Status" 
                          } : f
                        )
                      );
                    } else {
                      // Add new filter with explicit "Status" label
                      setActiveFilters(prev => [
                        ...prev,
                        { 
                          id: safeId, 
                          field: safeField, 
                          value: safeValue, 
                          displayLabel: "Status" 
                        }
                      ]);
                    }
                  }
                } else {
                  // When selecting "All", remove any status-related filters
                  if (statusFilters.length > 0) {
                    const firstStatusFilter = statusFilters[0];
                    if (firstStatusFilter && firstStatusFilter.field) {
                      const statusField = firstStatusFilter.field;
                      setActiveFilters(prev => prev.filter(f => f.field !== statusField));
                    }
                  }
                }
              }} className={tabsClassName}>
                <TabsList className="!bg-gray-100 !rounded-lg !p-2 !w-full !h-auto !flex !gap-2">
                  {!hideAllTab && (
                    <TabsTrigger 
                      value="all" 
                      className={cn(
                        "!rounded-md !flex-1 !px-4 !py-2 !text-sm !font-medium !h-auto !transition-colors",
                        "data-[state=active]:bg-[var(--button-secondary-active-bg)] data-[state=active]:border-2 data-[state=active]:border-[var(--button-secondary-active-border)] data-[state=active]:text-[var(--button-secondary-active-text)] data-[state=active]:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
                        "data-[state=inactive]:bg-[var(--button-tertiary-bg)] data-[state=inactive]:border data-[state=inactive]:border-[var(--button-tertiary-border)] data-[state=inactive]:text-[var(--button-tertiary-text)]"
                      )}
                    >
                      All
                      <Badge 
                        variant="solid-default"
                        className={cn(
                          "ml-2",
                          selectedStatusFilter === "all" && "bg-[var(--theme-color-primary-600)] text-white border-[var(--theme-color-primary-600)]"
                        )}
                      >
                        {data.length}
                      </Badge>
                    </TabsTrigger>
                  )}
                  {statusFilters.map((filter, index) => (
                    <TabsTrigger 
                      key={filter.id}
                      value={filter.id} 
                      className={cn(
                        "!rounded-md !flex-1 !px-4 !py-2 !text-sm !font-medium !h-auto !transition-colors !relative",
                        "data-[state=active]:bg-[var(--button-secondary-active-bg)] data-[state=active]:border-2 data-[state=active]:border-[var(--button-secondary-active-border)] data-[state=active]:text-[var(--button-secondary-active-text)] data-[state=active]:shadow-[0px_1px_2px_0px_var(--primary-shadow-color-1),_0px_0px_0px_4px_var(--primary-shadow-color-2)]",
                        "data-[state=inactive]:bg-[var(--button-tertiary-bg)] data-[state=inactive]:border data-[state=inactive]:border-[var(--button-tertiary-border)] data-[state=inactive]:text-[var(--button-tertiary-text)]"
                      )}
                    >
                      {filter.label}
                      <Badge 
                        variant="solid-default"
                        className={cn(
                          "ml-2",
                          selectedStatusFilter === filter.id && "bg-[var(--theme-color-primary-600)] text-white border-[var(--theme-color-primary-600)]"
                        )}
                      >
                        <HydrationSafeNumber 
                          value={filter.count !== undefined ? filter.count : data.filter(row => {
                            const fieldValue = row[filter.field as keyof TData];
                            if (fieldValue && typeof fieldValue === 'object' && 'text' in fieldValue) {
                              return fieldValue.text === filter.value;
                            }
                            return String(fieldValue) === filter.value;
                          }).length}
                        />
                      </Badge>
                      {filter.showNotification && (
                        <NotificationIndicator 
                          show={true} // Parent controls visibility via showNotification wrapper
                          delay={index * 0.3} // 300ms stagger between tabs from left to right
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Applied filters under tabs */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-3 pb-1 border-t">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {activeFilters.map((filter, index) => {
                  // Make sure filter fields are defined
                  const safeFilter = {
                    id: filter.id || `filter-${index}`,
                    field: filter.field || '',
                    value: filter.value || '',
                    displayLabel: filter.displayLabel || 'Filter' // Use a default if missing
                  };
                  
                  // Get filter options for this filter
                  const filterOption = combinedFilterOptions.find(
                    option => option.id === safeFilter.id || option.field === safeFilter.field
                  );
                  
                  // Prioritize the stored displayLabel over other options
                  const fieldLabel = safeFilter.displayLabel || filterOption?.label || 'Filter';
                  
                  // Enhanced value label resolution with better status filter support
                  let valueLabel = safeFilter.value;
                  
                  // First, check if this is a status filter and get label from statusFilters
                  if (statusFilters.length > 0) {
                    const statusFilter = statusFilters.find(sf => 
                      sf.value === safeFilter.value || sf.id === safeFilter.id
                    );
                    if (statusFilter) {
                      valueLabel = statusFilter.label;
                    }
                  }
                  
                  // If not found in status filters, check regular filter options
                  if (valueLabel === safeFilter.value && filterOption?.options) {
                    const optionLabel = filterOption.options.find(
                      opt => opt.value === safeFilter.value
                    )?.label;
                    if (optionLabel) {
                      valueLabel = optionLabel;
                    }
                  }
                  
                  // As a fallback, convert snake_case and other formats to user-friendly text
                  if (valueLabel === safeFilter.value) {
                    valueLabel = safeFilter.value
                      .replace(/_/g, ' ')
                      .replace(/([A-Z])/g, ' $1')
                      .toLowerCase()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                      .trim();
                  }
                  
                  return (
                    <Popover key={`${safeFilter.id}-${index}`}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="tertiary" 
                          className="h-8 pl-3 pr-8 flex items-center gap-2 relative"
                        >
                          <span className="font-medium">{fieldLabel}:</span> 
                          <span>{valueLabel}</span>
                          <div 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-sm bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeFilter(safeFilter.id);
                              return false;
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-0" align="start">
                        <div className="p-2 border-b">
                          <div className="font-medium">{fieldLabel}</div>
                        </div>
                        <div className="p-2">
                          <Input
                            type="search"
                            placeholder="Search..."
                            className="mb-2"
                            startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filterOption?.options ? (
                            <div className="p-1">
                              {filterOption.options.map(option => (
                                <Button
                                  key={option.value}
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-8 px-2 mb-1",
                                    safeFilter.value === option.value && "bg-muted font-medium"
                                  )}
                                  onClick={() => {
                                    // Update the filter value
                                    setActiveFilters(prev => 
                                      prev.map(f => (f.id === safeFilter.id || f.field === safeFilter.field) ? 
                                        { ...f, value: option.value } : f
                                      )
                                    );
                                  }}
                                >
                                  {safeFilter.value === option.value && (
                                    <Check className="mr-2 h-4 w-4 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{option.label}</span>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No options available
                              <Button
                                variant="link"
                                className="w-full mt-2"
                                onClick={() => removeFilter(safeFilter.id)}
                              >
                                Remove filter
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFilter(safeFilter.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                          >
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Main table container */}
      <div 
        ref={tableRef} 
        className={tableStyles.root}
        data-slot="table-root"
      >
        <div
          ref={tableBodyRef}
          style={{ 
            width: '100%',
            overflowX: 'auto',
            maxHeight: shouldVirtualize ? `${visibleHeight}px` : undefined,
            overflowY: shouldVirtualize ? 'auto' : undefined
          }}
          onScroll={shouldVirtualize ? handleScroll : undefined}
          data-slot="table-container"
        >
          <Table
            className={tableStyles.table}
            style={{
              width: minTableWidth,
              minWidth: '100%', // Ensure table is at least as wide as its container
              tableLayout: 'auto' // Allow columns to size to content
            }}
          >
            <TableHeader className={tableStyles.header}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={tableStyles.headerRow}>
                  {headerGroup.headers.map((header) => {
                    const { column } = header
                    const isPinned = column.getIsPinned()
                    const isLastLeftPinned =
                      isPinned === "left" && column.getIsLastColumn("left")
                    const isFirstRightPinned =
                      isPinned === "right" && column.getIsFirstColumn("right")

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          tableStyles.headerCell,
                          column.id && getColumnStyle(column.id).className,
                          // Add special override for checkbox headers
                          (column.id === 'select' || (typeof column.id === 'string' && column.id.toLowerCase().includes('checkbox'))) && 
                          "!pr-3 !pl-3 !py-2" // Force consistent padding
                        )}
                        colSpan={header.colSpan}
                        style={{
                          left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
                          right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
                          position: isPinned ? "sticky" : "relative",
                          width: column.getSize(),
                          minWidth: headerWidths[column.id] ? `${headerWidths[column.id]}px` : 
                            (column.id && getColumnStyle(column.id).minWidth) ? getColumnStyle(column.id).minWidth : undefined,
                          zIndex: isPinned ? 1 : 0,
                          ...(isPinned ? { '--col-size': `${column.getSize()}px` } as CSSProperties : {})
                        }}
                        data-pinned={isPinned || undefined}
                        data-last-col={
                          isLastLeftPinned
                            ? "left"
                            : isFirstRightPinned
                              ? "right"
                              : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : wrapHeaderContent(
                              flexRender(
                                // Get header content
                                header.column.columnDef.header,
                                header.getContext()
                              ),
                              column,
                              registerHeaderRef
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* Virtual scrolling top padding */}
              {shouldVirtualize && paddingTop > 0 && (
                <TableRow style={{ height: paddingTop }}>
                  <TableCell colSpan={table.getAllColumns().length} style={{ padding: 0, border: 'none' }} />
                </TableRow>
              )}
              
              {table.getRowModel().rows?.length ? (
                (shouldVirtualize 
                  ? table.getRowModel().rows.slice(startIndex, endIndex)
                  : table.getRowModel().rows
                ).map((row, virtualIndex) => {
                  const rowIndex = shouldVirtualize ? startIndex + virtualIndex : virtualIndex
                  const isExpanded = row.getIsExpanded()
                  const isSelected = row.getIsSelected()
                  
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={isSelected ? "selected" : undefined}
                        className={tableStyles.row(isExpanded, isSelected)}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const { column } = cell
                          const isPinned = column.getIsPinned()
                          const isLastLeftPinned =
                            isPinned === "left" && column.getIsLastColumn("left")
                          const isFirstRightPinned =
                            isPinned === "right" && column.getIsFirstColumn("right")

                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                tableStyles.cell,
                                column.id && getColumnStyle(column.id).className,
                                // Add special override for checkbox cells
                                (column.id === 'select' || (typeof column.id === 'string' && column.id.toLowerCase().includes('checkbox'))) && 
                                "!pr-3 !pl-3 !py-2" // Force consistent padding
                              )}
                              style={{
                                left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
                                right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
                                position: isPinned ? "sticky" : "relative",
                                width: column.getSize(),
                                minWidth: headerWidths[column.id] ? `${headerWidths[column.id]}px` : 
                                  (column.id && getColumnStyle(column.id).minWidth) ? getColumnStyle(column.id).minWidth : undefined,
                                zIndex: isPinned ? 1 : 0,
                                ...(isPinned ? { '--col-size': `${column.getSize()}px` } as CSSProperties : {})
                              }}
                              data-pinned={isPinned || undefined}
                              data-last-col={
                                isLastLeftPinned
                                  ? "left"
                                  : isFirstRightPinned
                                    ? "right"
                                    : undefined
                              }
                            >
                              {wrapCellContentWithNotification(
                                flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                ),
                                column.id,
                                row,
                                rowIndex,
                                getRowNotification
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      {isExpanded && (
                        <TableRow
                          key={`${row.id}-expanded`}
                          className={tableStyles.expandedRow}
                        >
                          <TableCell 
                            colSpan={table.getAllColumns().length}
                            className="p-0"
                          >
                            <div 
                              className={tableStyles.expandedContent.container} 
                              ref={el => {
                                if (el && containerWidth > 0) {
                                  // Always set width immediately without transitions
                                  el.style.transition = 'none';
                                  el.style.width = `${containerWidth}px`;
                                  
                                  // Force a reflow to ensure the width is applied immediately
                                  void el.offsetWidth;
                                }
                              }}
                            >
                              <ExpandedViewComponent 
                                row={row} 
                                containerWidth={containerWidth} 
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className={tableStyles.noResults}>
                    <HydrationSafeText>No results found.</HydrationSafeText>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Virtual scrolling bottom padding */}
              {shouldVirtualize && paddingBottom > 0 && (
                <TableRow style={{ height: paddingBottom }}>
                  <TableCell colSpan={table.getAllColumns().length} style={{ padding: 0, border: 'none' }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground flex items-center gap-2">
            <HydrationSafeText>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </HydrationSafeText>
            
            {/* Bulk actions dropdown */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && bulkActions && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                <DropdownMenu 
                  open={bulkActionsDropdownOpen} 
                  onOpenChange={(open) => {
                    setBulkActionsDropdownOpen(open);
                    // If closing without selecting an action and we're in two-step mode, clear selection
                    if (!open && enableTwoStepBulkActions && !selectedBulkAction) {
                      setSelectedBulkAction(null);
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      {selectedBulkAction ? selectedBulkAction.label : "Bulk Actions"} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {bulkActions.map((action, index) => (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => {
                          if (enableTwoStepBulkActions) {
                            setSelectedBulkAction(action);
                            setBulkActionsDropdownOpen(false);
                          } else {
                            action.onClick(table.getFilteredSelectedRowModel().rows);
                            setBulkActionsDropdownOpen(false);
                          }
                        }}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Process button - only show when two-step is enabled and an action is selected */}
                {enableTwoStepBulkActions && selectedBulkAction && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => {
                        selectedBulkAction.onClick(table.getFilteredSelectedRowModel().rows);
                        setSelectedBulkAction(null); // Clear selection after processing
                      }}
                    >
                      {processButtonText}
                    </Button>
                    {!hideCancelButton && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedBulkAction(null);
                          setBulkActionsDropdownOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-8">
            {/* Results per page */}
            <div className="flex items-center gap-3">
              <Label htmlFor="rows-per-page">Rows per page</Label>
              <Select 
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger id="rows-per-page" className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page number information */}
            <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
              <HydrationSafeText as="p" className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                <HydrationSafeNumber 
                  value={`${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}`}
                  className="text-foreground"
                />
                {" "}of{" "}
                <HydrationSafeNumber 
                  value={table.getFilteredRowModel().rows.length}
                  className="text-foreground"
                />
              </HydrationSafeText>
            </div>

            {/* Pagination */}
            <div>
              <Pagination>
                <PaginationContent>
                  {/* First page button */}
                  <PaginationItem>
                    <PaginationLink
                      className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => table.setPageIndex(0)}
                      aria-label="Go to first page"
                      aria-disabled={!table.getCanPreviousPage()}
                      role={!table.getCanPreviousPage() ? "link" : undefined}
                    >
                      <ChevronFirst size={16} aria-hidden="true" />
                    </PaginationLink>
                  </PaginationItem>

                  {/* Previous page button */}
                  <PaginationItem>
                    <PaginationLink
                      className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => table.previousPage()}
                      aria-label="Go to previous page"
                      aria-disabled={!table.getCanPreviousPage()}
                      role={!table.getCanPreviousPage() ? "link" : undefined}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </PaginationLink>
                  </PaginationItem>

                  {/* Next page button */}
                  <PaginationItem>
                    <PaginationLink
                      className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => table.nextPage()}
                      aria-label="Go to next page"
                      aria-disabled={!table.getCanNextPage()}
                      role={!table.getCanNextPage() ? "link" : undefined}
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </PaginationLink>
                  </PaginationItem>

                  {/* Last page button */}
                  <PaginationItem>
                    <PaginationLink
                      className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      aria-label="Go to last page"
                      aria-disabled={!table.getCanNextPage()}
                      role={!table.getCanNextPage() ? "link" : undefined}
                    >
                      <ChevronLast size={16} aria-hidden="true" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 