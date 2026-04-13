import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
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
