import { formatCurrency, formatDuration, maskId } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import { idTypeName } from "../../../utils/helper/constants";
import { numberToWordsINR } from "../../../utils/helper/numberToWords";
import type { HotelSettings, Stay } from "../../../utils/interfaces/Interface";
import { esc, generateUpiQrSvg } from "./billPrintStyles";

export interface FolioPrintOptions {
  stay: Stay;
  hotel: HotelSettings;
  copyType?: "ORIGINAL" | "DUPLICATE" | "PRO_FORMA";
  invoiceNo?: string;
  notes?: string;
}

export const generateLuxuryInvoiceHtml = ({
  stay,
  hotel,
  copyType = "ORIGINAL",
  invoiceNo,
  notes,
}: FolioPrintOptions): string => {
  const bill = stay.bill;
  const invNumber = invoiceNo || `${hotel.invoicePrefix || "GH-INV/2026/"}${stay.stayNo.replace(/\D/g, "") || "0482"}`;
  const chainName = hotel.chainName || "GRAND HORIZON HOTELS & RESORTS";
  const hotelName = hotel.hotelName || "Grand Horizon Palace & Spa";
  const brandTier = hotel.brandTier || "★★★★★ Signature Luxury Heritage";
  const issueDate = formatDateTime(stay.checkOutAt || new Date().toISOString());

  const taxPercent = bill?.taxPercent ?? hotel.taxPercent ?? 12;
  const halfTax = (taxPercent / 2).toFixed(1);
  const taxableAmount = bill?.taxableAmount ?? stay.totalAmount / (1 + taxPercent / 100);
  const totalTax = bill?.taxAmount ?? (stay.totalAmount - taxableAmount);
  const cgstAmount = totalTax / 2;
  const sgstAmount = totalTax / 2;

  const totalPaid = stay.paidAmount || stay.advanceAmount || 0;
  const balanceDue = stay.dueAmount || Math.max(0, stay.totalAmount - totalPaid);
  const refundDue = Math.max(0, totalPaid - stay.totalAmount);
  const amountInWords = numberToWordsINR(stay.totalAmount);

  const copyLabel =
    copyType === "ORIGINAL"
      ? "ORIGINAL FOR RECIPIENT"
      : copyType === "DUPLICATE"
      ? "DUPLICATE FOR SUPPLIER"
      : "PRO-FORMA STATEMENT";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Tax Invoice · ${esc(invNumber)} · ${esc(stay.guestName)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a; background: #fff; margin: 0; padding: 0;
      font-size: 11px; line-height: 1.45;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .invoice-wrapper { max-width: 800px; margin: 0 auto; }
    .header-table { width: 100%; border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 12px; }
    .brand-title { font-size: 19px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 2px 0; }
    .hotel-name { font-size: 14px; font-weight: 700; color: #1e3a8a; margin: 0 0 3px 0; }
    .brand-tier { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; color: #b45309; text-transform: uppercase; }
    .hotel-meta { font-size: 9.5px; color: #475569; line-height: 1.4; margin-top: 4px; }
    .doc-badge { display: inline-block; background: #0f172a; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; }
    .copy-badge { font-size: 9px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 9.5px; margin-top: 6px; }
    .meta-box table { width: 100%; }
    .meta-box td { padding: 1.5px 0; }
    .grid-2 { width: 100%; margin-bottom: 12px; }
    .card-panel { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #fff; vertical-align: top; }
    .card-panel h4 { margin: 0 0 6px 0; font-size: 10px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
    .card-table { width: 100%; font-size: 10px; }
    .card-table td { padding: 2px 0; vertical-align: top; }
    .label { color: #64748b; font-weight: 500; width: 38%; }
    .val { color: #0f172a; font-weight: 600; }
    .ledger-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .ledger-table th { background: #0f172a; color: #fff; font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
    .ledger-table th.right { text-align: right; }
    .ledger-table td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #1e293b; }
    .ledger-table td.right { text-align: right; font-family: monospace, sans-serif; font-weight: 600; }
    .ledger-table tr:nth-child(even) td { background: #f8fafc; }
    .total-row td { background: #f1f5f9 !important; font-weight: 800; color: #0f172a; border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a; }
    .gst-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
    .gst-table th { background: #e2e8f0; color: #334155; padding: 4px 6px; text-align: right; font-weight: 700; }
    .gst-table th:first-child { text-align: left; }
    .gst-table td { padding: 4px 6px; text-align: right; font-family: monospace, sans-serif; border-bottom: 1px solid #e2e8f0; }
    .gst-table td:first-child { text-align: left; font-family: sans-serif; font-weight: 600; }
    .words-box { background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 6px 10px; margin-bottom: 12px; font-size: 9.5px; }
    .summary-card { background: #f8fafc; border: 1.5px solid #0f172a; border-radius: 6px; padding: 8px 12px; }
    .summary-card table { width: 100%; }
    .summary-card td { padding: 3px 0; font-size: 10.5px; }
    .summary-card td.amount { text-align: right; font-family: monospace; font-weight: 700; }
    .highlight-due { color: #b91c1c; font-weight: 800 !important; font-size: 12px !important; }
    .highlight-paid { color: #15803d; font-weight: 800 !important; font-size: 12px !important; }
    .terms-box { font-size: 8.5px; color: #64748b; line-height: 1.35; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-bottom: 12px; }
    .terms-box strong { color: #334155; }
    .sign-table { width: 100%; margin-top: 15px; page-break-inside: avoid; }
    .sign-table td { width: 50%; vertical-align: bottom; padding: 0 15px; }
    .sign-line { border-top: 1px solid #0f172a; padding-top: 4px; font-size: 9.5px; font-weight: 700; color: #0f172a; text-align: center; }
    .sign-hint { font-size: 8px; color: #64748b; text-align: center; }
    .footer-bar { margin-top: 12px; text-align: center; font-size: 8.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <table class="header-table">
      <tr>
        <td style="width:62%;vertical-align:top;">
          <div class="brand-tier">${esc(brandTier)}</div>
          <h1 class="brand-title">${esc(chainName)}</h1>
          <h2 class="hotel-name">${esc(hotelName)}</h2>
          <div class="hotel-meta">
            ${esc(hotel.address)}${hotel.city ? ` · ${esc(hotel.city)}` : ""}<br/>
            <strong>Phone:</strong> ${esc(hotel.phone)} | <strong>Email:</strong> ${esc(hotel.email || "reservations@grandhorizon.com")}<br/>
            <strong>GSTIN:</strong> ${esc(hotel.gstin)} | <strong>State Code:</strong> ${esc(hotel.stateCode || "08 - Rajasthan")} | <strong>CIN:</strong> ${esc(hotel.cin || "U55101RJ2018PLC048291")}<br/>
            ${hotel.fssai ? `<strong>FSSAI Lic No:</strong> ${esc(hotel.fssai)} · ` : ""}<strong>Website:</strong> ${esc(hotel.website || "www.grandhorizonhotels.com")}
          </div>
        </td>
        <td style="width:38%;vertical-align:top;text-align:right;">
          <div class="doc-badge">TAX INVOICE</div>
          <div class="copy-badge">${esc(copyLabel)}</div>
          <div class="meta-box">
            <table>
              <tr><td style="color:#64748b;font-weight:600;">Invoice No:</td><td style="text-align:right;font-family:monospace;font-weight:800;color:#0f172a;">${esc(invNumber)}</td></tr>
              <tr><td style="color:#64748b;">Invoice Date:</td><td style="text-align:right;font-weight:600;">${esc(issueDate)}</td></tr>
              <tr><td style="color:#64748b;">Stay Folio:</td><td style="text-align:right;font-family:monospace;font-weight:700;">${esc(stay.stayNo)}</td></tr>
              <tr><td style="color:#64748b;">Room / Category:</td><td style="text-align:right;font-weight:600;">Rm ${esc(stay.roomNumber)} (${esc(stay.roomTypeName)})</td></tr>
              <tr><td style="color:#64748b;">Rate Plan:</td><td style="text-align:right;">${esc(stay.plan.name)}</td></tr>
              <tr><td style="color:#64748b;">Cashier / Duty:</td><td style="text-align:right;">${esc(hotel.managerSignatory?.split("(")[0] || "Front Desk Lead")}</td></tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <table class="grid-2" style="border-spacing:8px 0;margin:0 -8px 10px -8px;">
      <tr>
        <td class="card-panel" style="width:50%;">
          <h4>Guest / Billed To</h4>
          <table class="card-table">
            <tr><td class="label">Primary Guest:</td><td class="val">${esc(stay.guestName)}</td></tr>
            <tr><td class="label">Contact Phone:</td><td class="val font-mono">${esc(stay.guestPhone)}</td></tr>
            <tr><td class="label">ID Credential:</td><td class="val">${esc(idTypeName(stay.guestIdType))} (${esc(maskId(stay.guestIdNumber))})</td></tr>
            ${stay.companions && stay.companions.length > 0 ? `<tr><td class="label">Companions (${stay.companions.length}):</td><td class="val">${esc(stay.companions.map((c) => c.name).join(", "))}</td></tr>` : ""}
            <tr><td class="label">Company / B2B:</td><td class="val">${esc(notes?.includes("Company:") ? notes : "Direct Retail Guest")}</td></tr>
            <tr><td class="label">Place of Supply:</td><td class="val">${esc(hotel.stateCode || "08 - Rajasthan")} (Intra-state CGST+SGST)</td></tr>
          </table>
        </td>
        <td class="card-panel" style="width:50%;">
          <h4>Stay Particulars</h4>
          <table class="card-table">
            <tr><td class="label">Assigned Room:</td><td class="val">Room ${esc(stay.roomNumber)} · ${esc(stay.roomTypeName)}</td></tr>
            <tr><td class="label">Check-In:</td><td class="val">${formatDateTime(stay.checkInAt)}</td></tr>
            <tr><td class="label">Check-Out:</td><td class="val">${stay.checkOutAt ? formatDateTime(stay.checkOutAt) : "In-House Active"}</td></tr>
            <tr><td class="label">Duration of Stay:</td><td class="val">${bill ? formatDuration(bill.elapsedMinutes) : "—"} (${bill ? bill.billableHours : 0} Billable Hours)</td></tr>
            <tr><td class="label">Party Composition:</td><td class="val">${esc(stay.partyType || "STANDARD")} · ${stay.guestCount || (1 + stay.companions.length)} Guest(s)</td></tr>
            <tr><td class="label">Billing Status:</td><td class="val"><strong style="color:${balanceDue > 0 ? "#b91c1c" : "#15803d"};">${balanceDue > 0 ? `Settlement Pending (Due ${formatCurrency(balanceDue)})` : "Settled / Fully Cleared"}</strong></td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="ledger-table">
      <thead>
        <tr>
          <th style="width:5%;">#</th>
          <th style="width:43%;">Description of Services</th>
          <th style="width:12%;">SAC / HSN</th>
          <th style="width:12%;" class="right">Rate / Plan</th>
          <th style="width:10%;" class="right">Units</th>
          <th style="width:18%;" class="right">Taxable (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>01</td>
          <td><strong>Room Accommodation</strong> · ${esc(bill?.baseLabel || stay.plan.name)}<br/><span style="font-size:8.5px;color:#64748b;">${esc(stay.roomTypeName)} · Plan: ${esc(stay.plan.name)}</span></td>
          <td>${esc(hotel.sacCodeAccommodation || "996311")}</td>
          <td class="right">${formatCurrency(stay.plan.rate)}</td>
          <td class="right">1 Stay</td>
          <td class="right">${formatCurrency(bill?.baseAmount || stay.totalAmount)}</td>
        </tr>
        ${bill && bill.overtimeHours > 0 ? `
        <tr>
          <td>02</td>
          <td><strong>Extended Stay / Overtime Hours</strong><br/><span style="font-size:8.5px;color:#64748b;">Authorized extension (${bill.overtimeHours} hrs @ ₹${stay.plan.overtimeRate || 200}/hr)</span></td>
          <td>${esc(hotel.sacCodeAccommodation || "996311")}</td>
          <td class="right">₹${stay.plan.overtimeRate || 200}</td>
          <td class="right">${bill.overtimeHours} hrs</td>
          <td class="right">${formatCurrency(bill.overtimeAmount)}</td>
        </tr>` : ""}
        ${stay.extraCharges.map((ex, i) => `
        <tr>
          <td>${String(i + 3).padStart(2, "0")}</td>
          <td><strong>${esc(ex.label)}</strong><br/><span style="font-size:8.5px;color:#64748b;">In-room service / Hospitality amenity</span></td>
          <td>${esc(hotel.sacCodeFood || "996331")}</td>
          <td class="right">—</td>
          <td class="right">1</td>
          <td class="right">${formatCurrency(ex.amount)}</td>
        </tr>`).join("")}
        ${bill && bill.discount > 0 ? `
        <tr style="color:#047857;background:#f0fdf4;">
          <td>★</td>
          <td><strong>Management Rebate / Loyalty Discount</strong><br/><span style="font-size:8.5px;color:#059669;">Authorized special front-office concession</span></td>
          <td>—</td>
          <td class="right">—</td>
          <td class="right">—</td>
          <td class="right">- ${formatCurrency(bill.discount)}</td>
        </tr>` : ""}
        <tr class="total-row">
          <td colspan="5" style="text-align:right;">Subtotal (Taxable Value):</td>
          <td class="right">${formatCurrency(taxableAmount)}</td>
        </tr>
      </tbody>
    </table>

    <table style="width:100%;margin-bottom:6px;">
      <tr>
        <td style="width:60%;vertical-align:top;padding-right:10px;">
          <table class="gst-table">
            <thead>
              <tr>
                <th>Tax Category</th>
                <th>Taxable Value</th>
                <th>CGST (${halfTax}%)</th>
                <th>SGST (${halfTax}%)</th>
                <th>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hospitality & Accommodation (${taxPercent}%)</td>
                <td>${formatCurrency(taxableAmount)}</td>
                <td>${formatCurrency(cgstAmount)}</td>
                <td>${formatCurrency(sgstAmount)}</td>
                <td style="font-weight:700;">${formatCurrency(totalTax)}</td>
              </tr>
            </tbody>
          </table>
          <div class="words-box">
            <strong>Amount Chargeable (in words):</strong><br/>
            <em>${esc(amountInWords)}</em>
          </div>
          <div style="font-size:9px;color:#475569;margin-top:4px;">
            <strong>Bank Wire:</strong> ${esc(hotel.bankName || "HDFC Bank Ltd")} |
            <strong>A/C:</strong> ${esc(hotel.bankAccountNo || "50200084920194")} |
            <strong>IFSC:</strong> ${esc(hotel.bankIfsc || "HDFC0001234")}
          </div>
        </td>
        <td style="width:40%;vertical-align:top;">
          <div class="summary-card">
            <table>
              <tr><td>Gross Taxable:</td><td class="amount">${formatCurrency(taxableAmount)}</td></tr>
              <tr><td>CGST (${halfTax}%):</td><td class="amount">${formatCurrency(cgstAmount)}</td></tr>
              <tr><td>SGST (${halfTax}%):</td><td class="amount">${formatCurrency(sgstAmount)}</td></tr>
              <tr style="border-top:1.5px solid #0f172a;font-weight:800;font-size:12px;">
                <td style="padding-top:4px;">Grand Total:</td>
                <td class="amount" style="padding-top:4px;font-size:13px;color:#0f172a;">${formatCurrency(stay.totalAmount)}</td>
              </tr>
              <tr><td colspan="2"><hr style="border:0;border-top:1px dashed #cbd5e1;margin:4px 0;"/></td></tr>
              <tr><td>Advance Received (${stay.advanceMode || "CASH"}):</td><td class="amount" style="color:#0f172a;">- ${formatCurrency(stay.advanceAmount)}</td></tr>
              ${stay.paidAmount > stay.advanceAmount ? `<tr><td>Settlement Paid:</td><td class="amount">- ${formatCurrency(stay.paidAmount - stay.advanceAmount)}</td></tr>` : ""}
              <tr style="border-top:1.5px solid #0f172a;">
                <td style="padding-top:4px;"><strong>${refundDue > 0 ? "Refund Due to Guest:" : "Net Balance Payable:"}</strong></td>
                <td class="amount ${balanceDue > 0 ? "highlight-due" : "highlight-paid"}" style="padding-top:4px;">
                  ${formatCurrency(refundDue > 0 ? refundDue : balanceDue)}
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <table style="width:100%;margin-bottom:8px;border-top:1px solid #e2e8f0;padding-top:6px;">
      <tr>
        <td style="width:130px;vertical-align:middle;">
          ${hotel.upiId ? generateUpiQrSvg(hotel.upiId) : ""}
        </td>
        <td style="vertical-align:top;padding-left:12px;">
          <div class="terms-box">
            <strong>Standard Terms of Stay & Folio Settlement:</strong><br/>
            1. All bills are payable upon presentation.<br/>
            2. The management shall not be held liable for personal valuables unless deposited inside the hotel front office safety locker.<br/>
            3. Check-out time is strictly 11:00 AM. Unauthorized late checkout shall incur standard hourly tariff.<br/>
            4. Legal jurisdiction shall strictly lie with the competent courts of ${esc(hotel.city || "Jaipur, Rajasthan")}.<br/>
            5. Official computer-generated Tax Invoice issued under Indian Goods & Services Tax (GST) Act 2017.
          </div>
        </td>
      </tr>
    </table>

    <table class="sign-table">
      <tr>
        <td>
          <div style="height:35px;"></div>
          <div class="sign-line">Guest Signature</div>
          <div class="sign-hint">"I acknowledge correctness of services and agree to hotel terms"</div>
        </td>
        <td>
          <div style="height:35px;text-align:center;">
            <span style="font-size:9px;color:#94a3b8;font-style:italic;">[ Digitally Signed & Sealed by Front Office ]</span>
          </div>
          <div class="sign-line">For ${esc(hotelName)}</div>
          <div class="sign-hint">${esc(hotel.managerSignatory || "Duty Manager / Authorized Signatory")}</div>
        </td>
      </tr>
    </table>

    <div class="footer-bar">
      ${esc(chainName)} · Experience True Royal Hospitality · Thank you for your patronage!
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;
};

export const generateThermalReceiptHtml = ({ stay, hotel, invoiceNo }: FolioPrintOptions): string => {
  const bill = stay.bill;
  const invNumber = invoiceNo || `${hotel.invoicePrefix || "GH-INV/"}${stay.stayNo}`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt ${esc(invNumber)}</title>
  <style>
    @page { size: 80mm auto; margin: 3mm; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px; line-height: 1.35; color: #000;
      width: 74mm; margin: 0 auto; padding: 4px;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .double-line { border-top: 2px solid #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 2px 0; font-size: 11px; }
    td.right { text-align: right; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px;">${esc(hotel.chainName || "GRAND HORIZON")}</div>
  <div class="center bold">${esc(hotel.hotelName)}</div>
  <div class="center" style="font-size:10px;">${esc(hotel.address)}</div>
  <div class="center" style="font-size:10px;">Tel: ${esc(hotel.phone)}</div>
  ${hotel.gstin ? `<div class="center" style="font-size:10px;">GSTIN: ${esc(hotel.gstin)}</div>` : ""}

  <div class="double-line"></div>
  <div class="center bold">TAX INVOICE / CASH RECEIPT</div>
  <div class="line"></div>

  <table>
    <tr><td>Receipt No:</td><td class="right bold">${esc(invNumber)}</td></tr>
    <tr><td>Folio No:</td><td class="right">${esc(stay.stayNo)}</td></tr>
    <tr><td>Date:</td><td class="right">${formatDateTime(stay.checkOutAt || new Date().toISOString())}</td></tr>
    <tr><td>Guest:</td><td class="right bold">${esc(stay.guestName)}</td></tr>
    <tr><td>Room:</td><td class="right bold">Rm ${esc(stay.roomNumber)} (${esc(stay.roomTypeName)})</td></tr>
    <tr><td>Check-In:</td><td class="right">${formatDateTime(stay.checkInAt)}</td></tr>
    <tr><td>Check-Out:</td><td class="right">${formatDateTime(stay.checkOutAt || new Date().toISOString())}</td></tr>
  </table>

  <div class="line"></div>
  <div class="bold" style="margin-bottom:4px;">CHARGES BREAKDOWN:</div>
  <table>
    <tr><td>Room Accommodation</td><td class="right">${formatCurrency(bill?.baseAmount || stay.totalAmount)}</td></tr>
    ${bill && bill.overtimeHours > 0 ? `<tr><td>Overtime (${bill.overtimeHours} hrs)</td><td class="right">${formatCurrency(bill.overtimeAmount)}</td></tr>` : ""}
    ${stay.extraCharges.map((ex) => `<tr><td>${esc(ex.label)}</td><td class="right">${formatCurrency(ex.amount)}</td></tr>`).join("")}
    ${bill && bill.discount > 0 ? `<tr><td>Discount</td><td class="right">- ${formatCurrency(bill.discount)}</td></tr>` : ""}
    ${bill && bill.taxAmount > 0 ? `<tr><td>GST (${bill.taxPercent}%)</td><td class="right">${formatCurrency(bill.taxAmount)}</td></tr>` : ""}
  </table>

  <div class="double-line"></div>
  <table>
    <tr class="bold" style="font-size:13px;"><td>TOTAL AMOUNT:</td><td class="right">${formatCurrency(stay.totalAmount)}</td></tr>
    <tr><td>Advance Paid:</td><td class="right">- ${formatCurrency(stay.advanceAmount)}</td></tr>
    ${stay.paidAmount > stay.advanceAmount ? `<tr><td>Balance Paid:</td><td class="right">- ${formatCurrency(stay.paidAmount - stay.advanceAmount)}</td></tr>` : ""}
    <tr class="bold" style="font-size:12px;"><td>BALANCE DUE:</td><td class="right">${formatCurrency(stay.dueAmount)}</td></tr>
  </table>

  <div class="line"></div>
  <div class="center bold" style="margin:8px 0 4px 0;">THANK YOU FOR YOUR STAY!</div>
  <div class="center" style="font-size:9.5px;">Please visit us again.</div>
  <div class="center" style="font-size:8.5px;color:#444;margin-top:6px;">${esc(hotel.website || "www.grandhorizonhotels.com")}</div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>`;
};

export const generateRegCardHtml = (stay: Stay, hotel: HotelSettings): string => {
  const chainName = hotel.chainName || "GRAND HORIZON HOTELS & RESORTS";
  const hotelName = hotel.hotelName || "Grand Horizon Palace & Spa";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Registration Card · ${esc(stay.guestName)} · Room ${esc(stay.roomNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Inter', sans-serif; font-size: 11px; color: #0f172a; margin: 0; line-height: 1.45; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
    .brand { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; }
    .title { font-size: 13px; font-weight: 800; background: #0f172a; color: white; padding: 4px 10px; display: inline-block; margin-top: 5px; }
    table.form-grid { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    table.form-grid td { border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: top; font-size: 10.5px; }
    .lbl { color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .val { font-weight: 600; color: #0f172a; font-size: 11px; }
    .terms { font-size: 9px; color: #475569; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 4px; margin-bottom: 20px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size:10px;font-weight:700;color:#b45309;letter-spacing:1px;text-transform:uppercase;">Luxury Hospitality Collection</div>
    <div class="brand">${esc(chainName)}</div>
    <div style="font-size:13px;font-weight:700;color:#1e3a8a;">${esc(hotelName)}</div>
    <div style="font-size:9.5px;color:#475569;margin-top:2px;">${esc(hotel.address)} · Tel: ${esc(hotel.phone)} · GSTIN: ${esc(hotel.gstin)}</div>
    <div class="title">OFFICIAL GUEST REGISTRATION CARD</div>
  </div>

  <table class="form-grid">
    <tr>
      <td style="width:50%;"><div class="lbl">Primary Guest Full Name</div><div class="val">${esc(stay.guestName)}</div></td>
      <td style="width:25%;"><div class="lbl">Room Number</div><div class="val font-mono" style="font-size:14px;font-weight:800;">${esc(stay.roomNumber)}</div></td>
      <td style="width:25%;"><div class="lbl">Folio Reference</div><div class="val font-mono">${esc(stay.stayNo)}</div></td>
    </tr>
    <tr>
      <td><div class="lbl">Contact Phone Number</div><div class="val">${esc(stay.guestPhone)}</div></td>
      <td><div class="lbl">Room Category</div><div class="val">${esc(stay.roomTypeName)}</div></td>
      <td><div class="lbl">Rate Plan / Tariff</div><div class="val">${esc(stay.plan.name)} (${formatCurrency(stay.plan.rate)})</div></td>
    </tr>
    <tr>
      <td><div class="lbl">Identity Document Type</div><div class="val">${esc(idTypeName(stay.guestIdType))}</div></td>
      <td colspan="2"><div class="lbl">Verified ID Number (Masked)</div><div class="val font-mono">${esc(maskId(stay.guestIdNumber))}</div></td>
    </tr>
    <tr>
      <td><div class="lbl">Arrival Date & Time</div><div class="val">${formatDateTime(stay.checkInAt)}</div></td>
      <td><div class="lbl">Expected Departure</div><div class="val">${stay.expectedCheckOutAt ? formatDateTime(stay.expectedCheckOutAt) : "Open"}</div></td>
      <td><div class="lbl">Advance Deposit</div><div class="val">${formatCurrency(stay.advanceAmount)} (${stay.advanceMode || "CASH"})</div></td>
    </tr>
    <tr>
      <td colspan="3"><div class="lbl">Companions / Accompanying Guests</div><div class="val">${stay.companions && stay.companions.length > 0 ? esc(stay.companions.map((c) => `${c.name} (${idTypeName(c.idType)})`).join(", ")) : "Solo Guest"}</div></td>
    </tr>
  </table>

  <div class="terms">
    <strong>GUEST DECLARATION & HOTEL HOUSE RULES:</strong><br/>
    1. I declare that the particulars furnished above are true and correct.<br/>
    2. I agree to abide by all the rules and regulations of ${esc(hotelName)}, including checking out by 11:00 AM.<br/>
    3. The hotel accepts no responsibility for cash or valuables left unattended in guest rooms.
  </div>

  <table style="width:100%;margin-top:30px;">
    <tr>
      <td style="width:50%;border-top:1px solid #0f172a;padding-top:6px;text-align:center;">
        <strong>Guest Signature</strong><br/><span style="font-size:8.5px;color:#64748b;">(Signed on check-in verification)</span>
      </td>
      <td style="width:50%;border-top:1px solid #0f172a;padding-top:6px;text-align:center;">
        <strong>Duty Manager / Front Desk Executive</strong><br/><span style="font-size:8.5px;color:#64748b;">(Key Card & Welcome Pack Issued)</span>
      </td>
    </tr>
  </table>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>`;
};
