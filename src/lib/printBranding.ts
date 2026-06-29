import companyLogoUrl from "@/assets/branding/company-logo.png";
import companyStampUrl from "@/assets/branding/company-stamp.jpeg";

export const COMPANY_NAME = "CITY HOMES TECHNICAL SERVICES (L.L.C)";
export const COMPANY_NAME_AR = "سيتي هومس للخدمات الفنية (ش.ذ.م.م)";
export const COMPANY_CONTACT = {
  pobox: "P.O Box: 24966 Algarhoud Dubai U.A.E",
  tel: "Tel: 04-2347044",
  fax: "Fax: 04-2347055",
  mobile: "Mobile No. +971 54 292 0813",
  email: "Email: naeemghouri786@gmail.com",
};

export const COMPANY_LOGO_URL =
  typeof window !== "undefined" ? new URL(companyLogoUrl, window.location.origin).href : companyLogoUrl;
export const COMPANY_STAMP_URL =
  typeof window !== "undefined" ? new URL(companyStampUrl, window.location.origin).href : companyStampUrl;

// Cache for data-URL versions of brand images so the print window never shows a broken image.
const dataUrlCache: Record<string, string> = {};
async function toDataUrl(url: string): Promise<string> {
  if (dataUrlCache[url]) return dataUrlCache[url];
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    dataUrlCache[url] = dataUrl;
    return dataUrl;
  } catch {
    return url;
  }
}

export const brandedPrintCSS = `
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#0f172a;background:#fff}
  .page{min-height:100vh;display:flex;flex-direction:column;padding:24px 40px 140px;position:relative;overflow:hidden}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:520px;height:520px;opacity:0.07;pointer-events:none;z-index:0;background-repeat:no-repeat;background-size:contain;background-position:center}
  .page > *:not(.watermark){position:relative;z-index:1}
  .letterhead{display:flex;align-items:center;gap:18px;padding-bottom:14px;border-bottom:2px solid #c81e1e}
  .letterhead img{height:72px;width:auto;object-fit:contain}
  .letterhead .titles{flex:1;text-align:center}
  .letterhead .ar{font-size:20px;color:#0a1f5c;font-weight:700;letter-spacing:0.5px;direction:rtl}
  .letterhead .en{font-size:22px;color:#c81e1e;font-weight:800;letter-spacing:0.5px;margin-top:2px}
  .content{flex:1;padding:28px 0}
  .stamp-area{display:flex;justify-content:flex-end;margin-top:28px;padding-right:16px}
  .stamp-area img{height:130px;width:auto;opacity:0.92;mix-blend-mode:multiply}
  .footer-band{position:fixed;left:0;right:0;bottom:0;width:100%}
  .footer-band .stripe{height:6px;background:#c81e1e}
  .footer-band .bar{background:#0a1f5c;color:#fff;text-align:center;font-size:12px;line-height:1.6;padding:10px 16px}
  @media print{
    .page{padding:16px 28px 130px}
    .footer-band{position:fixed}
    .watermark{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
`;

export function brandedHeaderHTML(logoSrc: string = COMPANY_LOGO_URL) {
  return `
    <div class="letterhead">
      <img src="${logoSrc}" alt="City Homes Technical Services" />
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
export async function openBrandedPrintWindow(opts: {
  title: string;
  bodyHTML: string;
  extraCSS?: string;
  watermark?: boolean;
  stamp?: boolean;
}) {
  // Open immediately to keep the user-gesture for popup blockers, then fill in once images are ready.
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${opts.title}</title></head><body style="font-family:sans-serif;padding:24px;color:#64748b">Preparing document…</body></html>`);

  const [logoData, stampData] = await Promise.all([
    toDataUrl(COMPANY_LOGO_URL),
    opts.stamp || opts.watermark ? toDataUrl(COMPANY_STAMP_URL) : Promise.resolve(""),
  ]);

  const watermarkHTML = opts.watermark
    ? `<div class="watermark" style="background-image:url('${logoData}')"></div>`
    : "";
  const stampHTML = opts.stamp
    ? `<div class="stamp-area"><img src="${stampData}" alt="Company Stamp" /></div>`
    : "";

  w.document.open();
  w.document.write(`<!doctype html><html><head><title>${opts.title}</title>
    <style>${brandedPrintCSS}${opts.extraCSS || ""}</style></head>
    <body><div class="page">
      ${watermarkHTML}
      ${brandedHeaderHTML(logoData)}
      <div class="content">${opts.bodyHTML}${stampHTML}</div>
      ${brandedFooterHTML()}
    </div>
    <script>window.onload=()=>setTimeout(()=>window.print(),500)</script>
    </body></html>`);
  w.document.close();
}