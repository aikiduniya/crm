import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  record_label: string | null;
  read_by_admin: boolean;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: "bg-success/10 text-success border-success/20",
  update: "bg-primary/10 text-primary border-primary/20",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
};

export function NotificationsBell() {
  const { role } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [open, setOpen] = useState(false);

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setLogs(data as ActivityLog[]);
    };
    load();

    const channel = supabase
      .channel("activity_logs_bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => setLogs((prev) => [payload.new as ActivityLog, ...prev].slice(0, 20))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  const unreadCount = logs.filter((l) => !l.read_by_admin).length;

  const markAllRead = async () => {
    const ids = logs.filter((l) => !l.read_by_admin).map((l) => l.id);
    if (ids.length === 0) return;
    await supabase.from("activity_logs").update({ read_by_admin: true }).in("id", ids);
    setLogs((prev) => prev.map((l) => ({ ...l, read_by_admin: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <h4 className="font-semibold text-sm">Activity Notifications</h4>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs">
              <CheckCheck className="h-3.5 w-3.5 mr-1" />Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No activity yet</div>
          ) : (
            <ul className="divide-y">
              {logs.map((log) => (
                <li key={log.id} className={`p-3 text-sm ${!log.read_by_admin ? "bg-muted/40" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] ${actionColors[log.action] || ""}`}>
                      {log.action.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium capitalize">{log.module}</span>
                    {!log.read_by_admin && <span className="ml-auto h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{log.user_name}</span>{" "}
                    <span className="text-muted-foreground">({log.user_role})</span>{" "}
                    {log.action}d{" "}
                    {log.record_label && <span className="font-medium">"{log.record_label}"</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Link to="/activity" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">View full activity history</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}