import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn("relative w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-xs", containerClassName)}>
      <table ref={ref} className={cn("w-full caption-bottom text-body-sm text-text", className)} {...props} />
    </div>
  )
)
Table.displayName = "Table"

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("border-b border-border bg-surface-alt/60 text-text font-semibold", className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 divide-y divide-border/60", className)} {...props} />
  )
)
TableBody.displayName = "TableBody"

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t border-border bg-surface-alt/50 font-medium text-text", className)} {...props} />
  )
)
TableFooter.displayName = "TableFooter"

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors hover:bg-surface-alt/50 data-[state=selected]:bg-selected data-[state=selected]:text-selected-text",
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-11 px-3 sm:px-4 text-left align-middle font-bold text-text-muted text-caption sm:text-meta uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-3 sm:p-4 align-middle text-body-sm text-text [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-caption text-text-muted", className)} {...props} />
  )
)
TableCaption.displayName = "TableCaption"
