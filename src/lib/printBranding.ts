import logoAsset from "@/assets/company-logo.jpeg.asset.json";

export const COMPANY_NAME = "CITY HOMES TECHNICAL SERVICES (L.L.C)";
export const COMPANY_NAME_AR = "سيتي هومس للخدمات الفنية (ش.ذ.م.م)";
export const COMPANY_CONTACT = {
  pobox: "P.O Box: 24966 Algarhoud Dubai U.A.E",
  tel: "Tel: 04-2347044",
  fax: "Fax: 04-2347055",
  mobile: "Mobile No. 050-9277786 , 055-1814864",
  email: "Email: naeemghouri786@gmail.com",
};

export const COMPANY_LOGO_URL =
  typeof window !== "undefined" ? window.location.origin + logoAsset.url : logoAsset.url;

export const brandedPrintCSS = `
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#0f172a;background:#fff}
  .page{min-height:100vh;display:flex;flex-direction:column;padding:24px 40px 140px;position:relative}
  .letterhead{display:flex;align-items:center;gap:18px;padding-bottom:14px;border-bottom:2px solid #c81e1e}
  .letterhead img{height:72px;width:auto;object-fit:contain}
  .letterhead .titles{flex:1;text-align:center}
  .letterhead .ar{font-size:20px;color:#0a1f5c;font-weight:700;letter-spacing:0.5px;direction:rtl}
  .letterhead .en{font-size:22px;color:#c81e1e;font-weight:800;letter-spacing:0.5px;margin-top:2px}
  .content{flex:1;padding:28px 0}
  .footer-band{position:fixed;left:0;right:0;bottom:0;width:100%}
  .footer-band .stripe{height:6px;background:#c81e1e}
  .footer-band .bar{background:#0a1f5c;color:#fff;text-align:center;font-size:12px;line-height:1.6;padding:10px 16px}
  @media print{
    .page{padding:16px 28px 130px}
    .footer-band{position:fixed}
  }
`;

export function brandedHeaderHTML() {
  return `
    <div class="letterhead">
      <img src="${COMPANY_LOGO_URL}" alt="City Homes Technical Services" />
      <div class="titles">
        <div class="ar">${COMPANY_NAME_AR}</div>
        <div class="en">${COMPANY_NAME}</div>
      </div>
      <div style="width:72px"></div>
    </div>
  `;
}

export function brandedFooterHTML() {
  const c = COMPANY_CONTACT;
  return `
    <div class="footer-band">
      <div class="stripe"></div>
      <div class="bar">
        <div>${c.pobox} ${c.tel} ${c.fax}</div>
        <div>${c.mobile} ${c.email}</div>
      </div>
    </div>
  `;
}

/** Opens a print window with the branded letterhead + footer wrapping the given inner HTML. */
export function openBrandedPrintWindow(opts: { title: string; bodyHTML: string; extraCSS?: string }) {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${opts.title}</title>
    <style>${brandedPrintCSS}${opts.extraCSS || ""}</style></head>
    <body><div class="page">
      ${brandedHeaderHTML()}
      <div class="content">${opts.bodyHTML}</div>
      ${brandedFooterHTML()}
    </div>
    <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
    </body></html>`);
  w.document.close();
}