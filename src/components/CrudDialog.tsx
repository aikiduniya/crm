import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea" | "file";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  bucket?: string; // for file type
  accept?: string; // for file type
}

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  loading?: boolean;
}

export function CrudDialog({ open, onOpenChange, title, fields, initialData, onSubmit, loading }: CrudDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const defaults: Record<string, any> = {};
      fields.forEach(f => { defaults[f.name] = initialData?.[f.name] ?? ""; });
      setFormData(defaults);
    }
  }, [open, initialData, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up empty strings: convert to null for date/number fields
    const cleaned: Record<string, any> = {};
    fields.forEach(f => {
      const val = formData[f.name];
      if ((f.type === "date" || f.type === "number") && (val === "" || val === undefined)) {
        cleaned[f.name] = null;
      } else {
        cleaned[f.name] = val === "" ? null : val;
      }
    });
    await onSubmit(cleaned);
  };

  const handleFileUpload = async (field: FieldConfig, file: File) => {
    if (!field.bucket) return;
    setUploading(field.name);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(field.bucket).upload(path, file, { upsert: false });
      if (error) throw error;
      setFormData(p => ({ ...p, [field.name]: path }));
      toast({ title: "File uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "select" ? (
                <Select value={formData[field.name] || ""} onValueChange={v => setFormData(p => ({ ...p, [field.name]: v }))}>
                  <SelectTrigger><SelectValue placeholder={field.placeholder || `Select ${field.label}`} /></SelectTrigger>
                  <SelectContent>
                    {field.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea id={field.name} value={formData[field.name] || ""} onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))} placeholder={field.placeholder} />
              ) : field.type === "file" ? (
                <div className="flex items-center gap-2">
                  {formData[field.name] ? (
                    <div className="flex items-center gap-2 flex-1 rounded-md border px-3 py-2 text-sm bg-muted/30">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate flex-1 text-xs font-mono">{String(formData[field.name]).split("/").pop()}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(p => ({ ...p, [field.name]: null }))}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept={field.accept || ".pdf,.doc,.docx,.jpg,.jpeg,.png"} className="hidden" disabled={uploading === field.name}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(field, f); }} />
                      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30">
                        <Upload className="h-4 w-4" />
                        {uploading === field.name ? "Uploading..." : (field.placeholder || "Click to upload file")}
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <Input id={field.name} type={field.type} value={formData[field.name] || ""} onChange={e => setFormData(p => ({ ...p, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value }))} placeholder={field.placeholder} required={field.required} />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
