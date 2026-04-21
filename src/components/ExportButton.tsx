import { Button } from "@/components/ui/button";
import { Download, Lock, Clock, CheckCircle2 } from "lucide-react";
import { useExportPermission, type ExportModule } from "@/hooks/useExportPermission";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ExportButtonProps {
  module: ExportModule;
  onExport: () => void;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
}

export function ExportButton({ module, onExport, label = "Export", variant = "outline", size = "default" }: ExportButtonProps) {
  const { isAdmin, canExport, pending, activeApproval, requestExport } = useExportPermission(module);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (canExport) {
    return (
      <div className="flex items-center gap-2">
        {!isAdmin && activeApproval && (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-1" />Approved
          </Badge>
        )}
        <Button variant={variant} size={size} onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />{label}
        </Button>
      </div>
    );
  }

  if (pending) {
    return (
      <Button variant="outline" size={size} disabled>
        <Clock className="h-4 w-4 mr-2" />Awaiting admin approval
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size={size} onClick={() => setOpen(true)}>
        <Lock className="h-4 w-4 mr-2" />Request {label.toLowerCase()}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request export permission</DialogTitle>
            <DialogDescription>
              Exporting <b>{module}</b> data requires admin approval. Tell the admin briefly why you need this export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Quarterly review for finance team"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!reason.trim()) return;
                setSubmitting(true);
                await requestExport(reason.trim());
                setSubmitting(false);
                setOpen(false);
                setReason("");
              }}
              disabled={!reason.trim() || submitting}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
