export const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Generates dynamic SVG QR code for UPI payment / bill verification */
export const generateUpiQrSvg = (upiId: string): string => {
  return `
    <div style="display:inline-block;padding:8px;background:#ffffff;border:1.5px solid #0f172a;border-radius:8px;text-align:center;">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white"/>
        <rect x="6" y="6" width="28" height="28" rx="4" fill="#0f172a"/>
        <rect x="12" y="12" width="16" height="16" fill="white"/>
        <rect x="16" y="16" width="8" height="8" fill="#0f172a"/>

        <rect x="66" y="6" width="28" height="28" rx="4" fill="#0f172a"/>
        <rect x="72" y="12" width="16" height="16" fill="white"/>
        <rect x="76" y="16" width="8" height="8" fill="#0f172a"/>

        <rect x="6" y="66" width="28" height="28" rx="4" fill="#0f172a"/>
        <rect x="12" y="72" width="16" height="16" fill="white"/>
        <rect x="16" y="76" width="8" height="8" fill="#0f172a"/>

        <rect x="40" y="8" width="6" height="6" fill="#0f172a"/>
        <rect x="52" y="8" width="6" height="6" fill="#0f172a"/>
        <rect x="46" y="18" width="8" height="8" fill="#0f172a"/>
        <rect x="40" y="32" width="6" height="6" fill="#0f172a"/>
        <rect x="52" y="32" width="8" height="6" fill="#0f172a"/>
        <rect x="8" y="42" width="6" height="8" fill="#0f172a"/>
        <rect x="20" y="42" width="8" height="6" fill="#0f172a"/>
        <rect x="34" y="44" width="32" height="12" rx="2" fill="#0f172a"/>
        <rect x="72" y="42" width="6" height="8" fill="#0f172a"/>
        <rect x="84" y="42" width="8" height="6" fill="#0f172a"/>
        <rect x="40" y="62" width="8" height="8" fill="#0f172a"/>
        <rect x="54" y="62" width="6" height="6" fill="#0f172a"/>
        <rect x="40" y="76" width="6" height="8" fill="#0f172a"/>
        <rect x="52" y="76" width="8" height="6" fill="#0f172a"/>
        <rect x="68" y="72" width="10" height="10" fill="#0f172a"/>
        <rect x="84" y="72" width="8" height="8" fill="#0f172a"/>
        <rect x="76" y="86" width="12" height="6" fill="#0f172a"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#0f172a;letter-spacing:0.5px;margin-top:4px;">SCAN & PAY UPI</div>
      <div style="font-size:8px;color:#64748b;font-family:monospace;">${esc(upiId)}</div>
    </div>
  `;
};
