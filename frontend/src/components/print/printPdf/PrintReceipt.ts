import { formatCurrency, formatDuration, maskId } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import { idTypeName } from "../../../utils/helper/constants";
import type { HotelSettings, Stay } from "../../../utils/interfaces/Interface";

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Opens a print-ready receipt for a completed stay. */
export const printReceipt = (stay: Stay, hotel: HotelSettings) => {
  const bill = stay.bill;
  if (!bill) return;
  const row = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:3px 0;${bold ? "font-weight:700;" : ""}">${esc(label)}</td><td style="text-align:right;${bold ? "font-weight:700;" : ""}">${esc(value)}</td></tr>`;

  const rows = [
    row(bill.baseLabel, formatCurrency(bill.baseAmount)),
    bill.overtimeHours > 0 ? row(`Extra time · ${bill.overtimeHours} hr`, formatCurrency(bill.overtimeAmount)) : "",
    ...stay.extraCharges.map((c) => row(c.label, formatCurrency(c.amount))),
    bill.discount > 0 ? row("Discount", `- ${formatCurrency(bill.discount)}`) : "",
    bill.taxAmount > 0 ? row(`GST ${bill.taxPercent}%`, formatCurrency(bill.taxAmount)) : "",
    `<tr><td colspan="2"><hr/></td></tr>`,
    row("Total", formatCurrency(stay.totalAmount), true),
    row("Paid", formatCurrency(stay.paidAmount)),
    stay.dueAmount > 0 ? row("Balance due", formatCurrency(stay.dueAmount), true) : "",
  ].join("");

  const html = `<!doctype html><html><head><title>Receipt ${esc(stay.stayNo)}</title></head>
  <body style="font-family:Arial,sans-serif;max-width:380px;margin:20px auto;font-size:13px;color:#111">
    <div style="text-align:center">
      <h2 style="margin:0">${esc(hotel.hotelName)}</h2>
      <div>${esc(hotel.address)}</div>
      <div>${esc(hotel.phone)}${hotel.gstin ? ` · GSTIN ${esc(hotel.gstin)}` : ""}</div>
    </div><hr/>
    <table style="width:100%">
      ${row("Receipt", stay.stayNo)}
      ${row("Guest", stay.guestName)}
      ${row("Phone", stay.guestPhone)}
      ${row(idTypeName(stay.guestIdType), maskId(stay.guestIdNumber))}
      ${row("Room", `${stay.roomNumber} (${stay.roomTypeName})`)}
      ${row("Check-in", formatDateTime(stay.checkInAt))}
      ${row("Check-out", formatDateTime(stay.checkOutAt))}
      ${row("Stay", formatDuration(bill.elapsedMinutes))}
    </table><hr/>
    <table style="width:100%">${rows}</table><hr/>
    <div style="text-align:center">Thank you, please visit again!</div>
    <script>window.onload=function(){window.print();}</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=480,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
};
