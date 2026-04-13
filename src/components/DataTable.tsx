import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  action?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({ columns, data, title, action }: DataTableProps<T>) {
  return (
    <div className="bg-card rounded-xl border shadow-sm animate-fade-in">
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b">
          {title && <h3 className="font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead key={i} className={cn("text-xs uppercase tracking-wider font-semibold text-muted-foreground", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              {columns.map((col, i) => (
                <TableCell key={i} className={col.className}>
                  {typeof col.accessor === "function" ? col.accessor(row) : String(row[col.accessor] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    completed: "bg-success/10 text-success border-success/20",
    won: "bg-success/10 text-success border-success/20",
    paid: "bg-success/10 text-success border-success/20",
    approved: "bg-success/10 text-success border-success/20",
    "in progress": "bg-primary/10 text-primary border-primary/20",
    "in review": "bg-primary/10 text-primary border-primary/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    new: "bg-info/10 text-info border-info/20",
    qualified: "bg-info/10 text-info border-info/20",
    proposal: "bg-accent/10 text-accent border-accent/20",
    negotiation: "bg-accent/10 text-accent border-accent/20",
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    available: "bg-success/10 text-success border-success/20",
    "in use": "bg-primary/10 text-primary border-primary/20",
    maintenance: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Badge variant="outline" className={cn("capitalize text-[11px] font-medium", styles[status.toLowerCase()] || "")}>
      {status}
    </Badge>
  );
}
