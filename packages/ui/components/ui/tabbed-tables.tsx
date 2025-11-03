import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { AdvancedPinnedTable, AdvancedPinnedTableProps } from "./advanced-pinned-table"
import { HydrationSafeText } from "./hydration-safe-text"

/**
 * TabbedTables Component
 * 
 * A tabbed interface for displaying multiple tables with folder-style tabs.
 * Loading states are now handled by the individual AdvancedPinnedTable components.
 * 
 * @example
 * ```tsx
 * // Usage with data-driven loading
 * const tabs = [
 *   {
 *     id: "pending",
 *     title: "Pending",
 *     subtitle: "Items awaiting approval",
 *     tableProps: {
 *       data: pendingData,
 *       columns: columns,
 *       isLoading: isPendingDataLoading, // Pass loading state from your data fetching
 *       enableSearch: true,
 *       enableStatusFilter: true,
 *       statusFilters: [...]
 *     }
 *   },
 *   {
 *     id: "approved", 
 *     title: "Approved",
 *     subtitle: "Items already approved",
 *     tableProps: {
 *       data: approvedData,
 *       columns: columns,
 *       isLoading: isApprovedDataLoading, // Each tab can have its own loading state
 *       enableSearch: true,
 *       enableStatusFilter: true,
 *       statusFilters: [...]
 *     }
 *   }
 * ]
 * 
 * return <TabbedTables tabs={tabs} />
 * ```
 */

export interface TabConfig<TData = any> {
  /** Unique identifier for the tab */
  id: string
  /** Tab title */
  title: string
  /** Optional icon for the tab */
  icon?: LucideIcon
  /** Subtitle with metrics or additional info */
  subtitle: string
  /** Configuration for the AdvancedPinnedTable */
  tableProps: AdvancedPinnedTableProps<TData>
  /** Optional badge count to show on the tab */
  badgeCount?: number
}

export interface TabbedTablesProps {
  /** Array of tab configurations (max 4 tabs) */
  tabs: TabConfig[]
  /** Initially active tab ID */
  defaultActiveTab?: string
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void
  /** Additional className for the container */
  className?: string
}



export function TabbedTables({
  tabs,
  defaultActiveTab,
  onTabChange,
  className,
}: TabbedTablesProps) {
  // Limit to 4 tabs maximum
  const limitedTabs = tabs.slice(0, 4)
  
  const [activeTab, setActiveTab] = React.useState(
    defaultActiveTab || limitedTabs[0]?.id || ""
  )

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return
    
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabConfig = limitedTabs.find(tab => tab.id === activeTab)
  const activeTabIndex = limitedTabs.findIndex(tab => tab.id === activeTab)

  if (limitedTabs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tabs configured
      </div>
    )
  }

    return (
    <div 
      className={cn("space-y-0", className)} 
      style={{ 
        filter: "drop-shadow(0px 2px 4px oklch(20.99130133% 0.034134981 263.4360409 / 0.06)) drop-shadow(0px 4px 8px oklch(20.99130133% 0.034134981 263.4360409 / 0.1))"
      }}
    >
      {/* Tab Headers - Folder Tab Style */}
      <div className="flex items-start gap-4 relative">
        {limitedTabs.map((tab, index) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "group relative px-6 py-4 border flex-1",
                "flex flex-col items-start justify-center text-left space-y-1",
                // Unified transition for all properties
                "transition-[background-color,border-color,color,height] duration-150 ease-out",
                isActive
                  ? "bg-white border-slate-200 z-10 h-[100px] -mb-[1px] rounded-t-lg border-b-0 cursor-default"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-muted-foreground hover:text-foreground h-[92px] rounded-lg cursor-pointer"
              )}
            >
              {/* Tab Title with Icon */}
              <div className="flex items-center space-x-2">
                {Icon && (
                  <Icon className={cn(
                    "h-5 w-5",
                    // Synchronized transition with parent
                    "transition-colors duration-150 ease-out",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <HydrationSafeText 
                  className={cn(
                    "truncate",
                    // Synchronized transition with parent
                    "transition-colors duration-150 ease-out",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  style={{
                    fontSize: "1rem",
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "175%",
                    letterSpacing: "0.00938rem"
                  }}
                >
                  {tab.title}
                </HydrationSafeText>
              </div>
              
              {/* Tab Subtitle */}
              <HydrationSafeText 
                className={cn(
                  "text-sm truncate w-full",
                  // Synchronized transition with parent
                  "transition-colors duration-150 ease-out",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                )}
              >
                {tab.subtitle}
              </HydrationSafeText>
            </button>
          )
        })}
      </div>

      {/* Table Container - Connected to Active Tab */}
      <div className={cn(
        "bg-white border border-slate-200 rounded-lg",
        "min-h-[400px]", // Minimum height for consistency
        // Dynamic corner rounding based on active tab position
        activeTabIndex === 0 && "rounded-tl-none",
        activeTabIndex === limitedTabs.length - 1 && "rounded-tr-none"
      )}>
        {/* Visual connection to active tab - simplified approach */}
        <div 
          className={cn(
            "h-[1px] bg-white",
            activeTabIndex === 0 && "ml-0 mr-auto w-[calc(100%/var(--tab-count))]" as any,
            activeTabIndex === limitedTabs.length - 1 && "ml-auto mr-0 w-[calc(100%/var(--tab-count))]" as any,
            activeTabIndex > 0 && activeTabIndex < limitedTabs.length - 1 && "mx-auto w-[calc(100%/var(--tab-count))]" as any
          )}
          style={{
            '--tab-count': limitedTabs.length
          } as React.CSSProperties}
        />
        
        {/* Table Content - Improved container for expanded rows */}
        <div className="p-6">
          {activeTabConfig ? (
            <AdvancedPinnedTable 
              key={activeTab} // Force remount when tab changes
              {...activeTabConfig.tableProps} 
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No tab configuration found
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 