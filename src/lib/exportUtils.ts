// CSV + simple PDF export helpers (client-side, no extra deps)
import { openBrandedPrintWindow } from "./printBranding";

export function downloadCSV(filename: string, rows: Record<string, any>[], columns?: string[]) {
  if (!rows.length) {
    const blob = new Blob(["(no data)"], { type: "text/csv" });
    triggerDownload(blob, filename);
    return;
  }
  const cols = columns || Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map(r => cols.map(c => escape(r[c])).join(","))].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printInvoice(invoice: {
  invoice_number: string; amount: number; status: string;
  due_date?: string | null; paid_date?: string | null; notes?: string | null;
  client_name?: string; project_name?: string; created_at?: string;
}) {
  const fmt = (n: number) => n.toLocaleString("en-AE", { style: "currency", currency: "AED" });
  const issued = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const body = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
      <div>
        <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b">Bill To</div>
        <div style="font-size:16px;font-weight:600;margin-top:4px">${invoice.client_name || "—"}</div>
        <div style="font-size:13px;color:#475569;margin-top:2px">Project: ${invoice.project_name || "—"}</div>
      </div>
      <div style="text-align:right">
        <h1 style="font-size:30px;margin:0;color:#0a1f5c;letter-spacing:-0.5px">INVOICE</h1>
        <div style="color:#64748b;font-size:13px;line-height:1.6;margin-top:4px">
          <strong style="color:#0f172a;font-size:14px">${invoice.invoice_number}</strong><br>
          Issued ${issued}<br>Due ${invoice.due_date || "—"}
        </div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      <thead><tr>
        <th style="background:#0a1f5c;color:#fff;text-align:left;padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Description</th>
        <th style="background:#0a1f5c;color:#fff;text-align:right;padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
      </tr></thead>
      <tbody><tr>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0">${invoice.notes || "Services rendered"}</td>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${fmt(invoice.amount)}</td>
      </tr></tbody>
    </table>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:2px solid #0a1f5c">
      <div style="font-size:13px;color:#475569">Status: <strong style="color:#0a1f5c">${invoice.status}</strong>${invoice.paid_date ? ` · Paid on ${invoice.paid_date}` : ""}</div>
      <div style="font-size:22px;font-weight:700;color:#0a1f5c">Total: ${fmt(invoice.amount)}</div>
    </div>
  `;
  openBrandedPrintWindow({ title: invoice.invoice_number, bodyHTML: body });
}

/** Print a branded report with a title and a generic data table (used for non-invoice exports). */
export function printBrandedTable(opts: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Record<string, any>[];
}) {
  const head = opts.columns.map(c =>
    `<th style="background:#0a1f5c;color:#fff;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">${c}</th>`
  ).join("");
  const body = opts.rows.map(r =>
    `<tr>${opts.columns.map(c => `<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${r[c] ?? ""}</td>`).join("")}</tr>`
  ).join("");
  const html = `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px">
      <div>
        <h1 style="font-size:24px;margin:0;color:#0a1f5c">${opts.title}</h1>
        ${opts.subtitle ? `<div style="color:#64748b;font-size:13px;margin-top:4px">${opts.subtitle}</div>` : ""}
      </div>
      <div style="color:#64748b;font-size:12px">Generated ${new Date().toLocaleString()}</div>
    </div>
    <table style="width:100%;border-collapse:collapse"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    ${opts.rows.length === 0 ? `<div style="text-align:center;color:#94a3b8;padding:32px">No records</div>` : ""}
  `;
  openBrandedPrintWindow({ title: opts.title, bodyHTML: html });
}
