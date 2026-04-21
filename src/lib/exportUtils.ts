// CSV + simple PDF export helpers (client-side, no extra deps)
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
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  w.document.write(`<!doctype html><html><head><title>${invoice.invoice_number}</title>
    <style>
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a;padding:48px;max-width:780px;margin:0 auto}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e3a5f;padding-bottom:24px;margin-bottom:32px}
      .brand{font-size:28px;font-weight:700;color:#1e3a5f}.brand small{display:block;font-size:13px;font-weight:400;color:#64748b;margin-top:4px}
      h1{font-size:34px;margin:0;color:#1e3a5f;letter-spacing:-0.5px}
      .meta{text-align:right;color:#64748b;font-size:13px;line-height:1.6}
      .meta strong{color:#0f172a;font-size:15px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:32px 0}
      .label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:6px}
      .value{font-size:15px;color:#0f172a}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      th{background:#f1f5f9;text-align:left;padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569}
      td{padding:14px 12px;border-bottom:1px solid #e2e8f0}
      .total{text-align:right;font-size:24px;font-weight:700;color:#1e3a5f;margin-top:24px;padding-top:16px;border-top:2px solid #1e3a5f}
      .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#fef3c7;color:#92400e}
      .badge.paid{background:#d1fae5;color:#065f46}.badge.overdue{background:#fee2e2;color:#991b1b}
      .notes{margin-top:32px;padding:16px;background:#f8fafc;border-radius:8px;color:#475569;font-size:13px;line-height:1.6}
      @media print{body{padding:24px}}
    </style></head><body>
    <div class="head">
      <div><div class="brand">BuildOps CRM<small>Construction Management Suite</small></div></div>
      <div><h1>INVOICE</h1><div class="meta"><strong>${invoice.invoice_number}</strong><br>Issued ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</div></div>
    </div>
    <div class="grid">
      <div><div class="label">Bill To</div><div class="value"><strong>${invoice.client_name || "—"}</strong></div></div>
      <div><div class="label">Project</div><div class="value">${invoice.project_name || "—"}</div></div>
      <div><div class="label">Due Date</div><div class="value">${invoice.due_date || "—"}</div></div>
      <div><div class="label">Status</div><div class="value"><span class="badge ${invoice.status.toLowerCase()}">${invoice.status}</span></div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody><tr><td>${invoice.notes || "Services rendered"}</td><td style="text-align:right">${fmt(invoice.amount)}</td></tr></tbody>
    </table>
    <div class="total">Total: ${fmt(invoice.amount)}</div>
    ${invoice.paid_date ? `<div class="notes">Paid on ${invoice.paid_date}</div>` : ""}
    <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
    </body></html>`);
  w.document.close();
}
