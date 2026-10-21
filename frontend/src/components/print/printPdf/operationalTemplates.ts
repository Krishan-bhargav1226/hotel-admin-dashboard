import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { HotelSettings, LostAndFoundItem, NightAuditRecord } from "../../../utils/interfaces/Interface";
import { esc } from "./billPrintStyles";

export const generateNightAuditFlashHtml = (
  record: NightAuditRecord,
  hotel?: HotelSettings | null
): string => {
  const chainName = hotel?.chainName || "GRAND HORIZON HOTELS & RESORTS";
  const hotelName = hotel?.hotelName || "Grand Horizon Palace & Spa";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Night Audit Flash Report · ${esc(record.businessDate)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; color: #0f172a; margin: 0; line-height: 1.45; }
    .header { border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
    .title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .badge { background: #0f172a; color: white; padding: 3px 8px; font-weight: 700; font-size: 10px; border-radius: 4px; display: inline-block; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #f1f5f9; text-align: left; padding: 6px 10px; font-size: 10px; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    td.right, th.right { text-align: right; }
    .kpi-grid { display: flex; gap: 10px; margin-bottom: 15px; }
    .kpi-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; }
    .kpi-val { font-size: 18px; font-weight: 800; font-family: monospace; }
    .kpi-lbl { font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;">Executive Night Audit & Manager Flash</div>
    <div class="title">${esc(chainName)} · ${esc(hotelName)}</div>
    <div style="font-size:10px;color:#475569;margin-top:2px;">
      Business Date: <strong>${esc(record.businessDate)}</strong> · Audited: ${formatDateTime(record.auditTimestamp)} · Auditor: ${esc(record.auditedBy)}
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-val" style="color:#1e3a8a;">${record.occupancyRate}%</div>
      <div class="kpi-lbl">Occupancy (${record.occupiedRooms}/${record.totalRooms})</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val" style="color:#047857;">${formatCurrency(record.totalRevenue)}</div>
      <div class="kpi-lbl">Total Gross Revenue</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val">${formatCurrency(record.adr)}</div>
      <div class="kpi-lbl">ADR (Average Daily Rate)</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val" style="color:#b45309;">${formatCurrency(record.revPar)}</div>
      <div class="kpi-lbl">RevPAR</div>
    </div>
  </div>

  <h4 style="font-size:11px;text-transform:uppercase;margin:0 0 6px 0;border-bottom:1px solid #0f172a;padding-bottom:3px;">
    Revenue Breakdown & GST Schedule
  </h4>
  <table>
    <thead>
      <tr><th>Revenue Department</th><th>SAC Code</th><th class="right">Net Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Room Accommodation Tariff</td><td style="font-family:monospace;">${hotel?.sacCodeAccommodation || "996311"}</td><td class="right" style="font-weight:600;">${formatCurrency(record.roomRevenue)}</td></tr>
      <tr><td>POS Restaurant & In-Room Dining</td><td style="font-family:monospace;">${hotel?.sacCodeFood || "996331"}</td><td class="right" style="font-weight:600;">${formatCurrency(record.posRevenue)}</td></tr>
      <tr><td>Ancillary Guest Services</td><td style="font-family:monospace;">996339</td><td class="right" style="font-weight:600;">${formatCurrency(record.servicesRevenue)}</td></tr>
      <tr style="font-weight:800;background:#f8fafc;border-top:1.5px solid #0f172a;">
        <td colspan="2">Gross Operational Turnover:</td>
        <td class="right" style="font-size:13px;color:#047857;">${formatCurrency(record.totalRevenue)}</td>
      </tr>
      <tr>
        <td colspan="2">Estimated GST Liability (12%):</td>
        <td class="right" style="font-family:monospace;">${formatCurrency(record.totalGst)}</td>
      </tr>
    </tbody>
  </table>

  <h4 style="font-size:11px;text-transform:uppercase;margin:15px 0 6px 0;border-bottom:1px solid #0f172a;padding-bottom:3px;">
    Cashier & Tender Settlement Balance
  </h4>
  <table>
    <thead>
      <tr><th>Payment Mode</th><th class="right">Reconciled Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Cash Drawer Handover</td><td class="right font-mono">${formatCurrency(record.settlements.cash)}</td></tr>
      <tr><td>UPI & Dynamic QR Payments</td><td class="right font-mono">${formatCurrency(record.settlements.upi)}</td></tr>
      <tr><td>Credit / Debit EDC POS Cards</td><td class="right font-mono">${formatCurrency(record.settlements.card)}</td></tr>
      <tr style="font-weight:800;background:#f8fafc;border-top:1.5px solid #0f172a;">
        <td>Total Reconciled Collections:</td>
        <td class="right" style="font-size:13px;">${formatCurrency(record.settlements.cash + record.settlements.upi + record.settlements.card)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top:20px;border-top:1px solid #0f172a;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;">
    <div><strong>Prepared By:</strong> ${esc(record.auditedBy)}</div>
    <div><strong>General Manager Verification:</strong> _________________________</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>`;
};

export const generateLuggageTagHtml = (
  item: LostAndFoundItem,
  hotel?: HotelSettings | null
): string => {
  const hotelName = hotel?.hotelName || "Grand Horizon Palace & Spa";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Custody Tag · ${esc(item.itemNo)}</title>
  <style>
    @page { size: 100mm 140mm; margin: 4mm; }
    body { font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; color: #000; margin: 0; padding: 4px; }
    .tag-box { border: 2px dashed #000; border-radius: 8px; padding: 10px; }
    .center { text-align: center; }
    .title { font-size: 14px; font-weight: 800; text-transform: uppercase; }
    .item-no { font-family: monospace; font-size: 16px; font-weight: 800; background: #000; color: #fff; padding: 3px 8px; border-radius: 4px; display: inline-block; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 3px 0; font-size: 10.5px; vertical-align: top; }
    .lbl { color: #555; width: 40%; font-size: 9.5px; font-weight: 700; text-transform: uppercase; }
    .val { font-weight: 700; color: #000; }
  </style>
</head>
<body>
  <div class="tag-box">
    <div class="center">
      <div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Hotel Custody Vault</div>
      <div class="title">${esc(hotelName)}</div>
      <div class="item-no">${esc(item.itemNo)}</div>
    </div>

    <table>
      <tr><td class="lbl">Article:</td><td class="val">${esc(item.title)}</td></tr>
      <tr><td class="lbl">Category:</td><td class="val">${esc(item.category)}</td></tr>
      <tr><td class="lbl">Location Found:</td><td class="val">${esc(item.locationFound)}</td></tr>
      <tr><td class="lbl">Date & Time:</td><td class="val">${esc(item.foundDate)} ${esc(item.foundTime)}</td></tr>
      <tr><td class="lbl">Custody Locker:</td><td class="val" style="font-size:13px;font-family:monospace;">${esc(item.storageLocker)}</td></tr>
      <tr><td class="lbl">Found By Staff:</td><td class="val">${esc(item.foundByStaff)}</td></tr>
      ${item.guestName ? `<tr><td class="lbl">Guest Name:</td><td class="val">${esc(item.guestName)}</td></tr>` : ""}
      ${item.guestPhone ? `<tr><td class="lbl">Guest Phone:</td><td class="val font-mono">${esc(item.guestPhone)}</td></tr>` : ""}
    </table>

    <div style="margin-top:10px;border-top:1px dashed #000;padding-top:6px;font-size:8.5px;color:#333;text-align:center;">
      Articles unclaimed after 90 days are subject to disposal as per hotel standard operating policies.
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>`;
};
