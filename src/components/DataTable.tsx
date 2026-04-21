import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  action?: React.ReactNode;
  searchKeys?: (keyof T)[];
  filters?: FilterOption[];
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string | number }>({ columns, data, title, action, searchKeys, filters, searchPlaceholder = "Search..." }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim() && searchKeys?.length) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
      );
    }
    Object.entries(filterValues).forEach(([key, val]) => {
      if (val && val !== "__all__") {
        result = result.filter((row) => String((row as any)[key] ?? "") === val);
      }
    });
    return result;
  }, [data, search, searchKeys, filterValues]);

  const hasControls = !!searchKeys?.length || !!filters?.length;
  const hasActiveFilters = search.trim() !== "" || Object.values(filterValues).some((v) => v && v !== "__all__");

  return (
    <div className="bg-card rounded-xl border shadow-sm animate-fade-in">
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b">
          {title && <h3 className="font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      {hasControls && (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-muted/30">
          {searchKeys?.length ? (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 h-9"
              />
            </div>
          ) : null}
          {filters?.map((f) => (
            <Select
              key={f.key}
              value={filterValues[f.key] || "__all__"}
              onValueChange={(v) => setFilterValues((prev) => ({ ...prev, [f.key]: v }))}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {f.label}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterValues({}); }}>
              <X className="h-4 w-4 mr-1" />Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {data.length}
          </div>
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
          {filtered.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="text-center py-12 text-sm text-muted-foreground">
                No records found
              </TableCell>
            </TableRow>
          ) : filtered.map((row) => (
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
