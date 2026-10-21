import { QrCode, ShieldCheck } from "lucide-react";
import { formatCurrency, formatDuration, maskId } from "../../../../utils/helper/helper";
import { formatDateTime } from "../../../../utils/date/dateUtils";
import { idTypeName } from "../../../../utils/helper/constants";
import type { HotelSettings, Stay } from "../../../../utils/interfaces/Interface";
import type { CopyType } from "./FolioHeader";

interface FolioInvoicePreviewProps {
  stay: Stay;
  hotel: HotelSettings;
  invNumber: string;
  copyType: CopyType;
}

export function FolioInvoicePreview({ stay, hotel, invNumber, copyType }: FolioInvoicePreviewProps) {
  const bill = stay.bill;
  const totalPaid = stay.paidAmount || stay.advanceAmount || 0;
  const balanceDue = stay.dueAmount || Math.max(0, stay.totalAmount - totalPaid);
  const refundDue = Math.max(0, totalPaid - stay.totalAmount);
  const taxPercent = bill?.taxPercent ?? hotel.taxPercent ?? 12;

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
      {/* Brand Top */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
            {hotel.brandTier || "★★★★★ Signature Luxury Heritage"}
          </span>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-950">
            {hotel.chainName || "GRAND HORIZON HOTELS & RESORTS"}
          </h2>
          <h3 className="text-sm font-bold text-brand-800">{hotel.hotelName}</h3>
          <p className="mt-1 max-w-md text-[11px] text-slate-600">
            {hotel.address}
            <br />
            Tel: {hotel.phone} · GSTIN: <strong>{hotel.gstin}</strong> · State: {hotel.stateCode || "08 - Rajasthan"}
          </p>
        </div>
        <div className="text-right">
          <span className="rounded-sm bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
            TAX INVOICE
          </span>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {copyType === "ORIGINAL" ? "Original for Recipient" : "Duplicate for Supplier"}
          </div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs font-medium">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Invoice No:</span>
              <strong className="font-mono">{invNumber}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Date:</span>
              <span>{formatDateTime(stay.checkOutAt || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Folio Ref:</span>
              <span className="font-mono">{stay.stayNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest & Stay Profile */}
      <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
          <h4 className="mb-2 font-bold uppercase tracking-wider text-brand-900">Billed To / Guest Details</h4>
          <p className="text-sm font-bold text-slate-900">{stay.guestName}</p>
          <p className="font-mono text-slate-600">{stay.guestPhone}</p>
          <p className="text-slate-600">
            ID: {idTypeName(stay.guestIdType)} ({maskId(stay.guestIdNumber)})
          </p>
          {stay.companions && stay.companions.length > 0 && (
            <p className="text-[11px] text-slate-500">
              Companions: {stay.companions.map((c) => c.name).join(", ")}
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-500">Place of Supply: {hotel.stateCode || "08 - Rajasthan"}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
          <h4 className="mb-2 font-bold uppercase tracking-wider text-brand-900">Stay Particulars</h4>
          <p className="font-semibold text-slate-900">
            Room {stay.roomNumber} · {stay.roomTypeName}
          </p>
          <p className="text-slate-600">Rate Plan: {stay.plan.name}</p>
          <p className="text-slate-600">Check-in: {formatDateTime(stay.checkInAt)}</p>
          <p className="text-slate-600">
            Check-out: {stay.checkOutAt ? formatDateTime(stay.checkOutAt) : "In-House Active"}
          </p>
          <p className="text-[11px] text-slate-500">
            Duration: {bill ? formatDuration(bill.elapsedMinutes) : "Active"}
          </p>
        </div>
      </div>

      {/* Itemized Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-800">
            <th className="px-2 py-2 text-left">Description</th>
            <th className="px-2 py-2 text-center">SAC Code</th>
            <th className="px-2 py-2 text-right">Rate</th>
            <th className="px-2 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="px-2 py-2 font-medium">Room Accommodation ({stay.plan.name})</td>
            <td className="px-2 py-2 text-center font-mono text-slate-500">
              {hotel.sacCodeAccommodation || "996311"}
            </td>
            <td className="px-2 py-2 text-right">{formatCurrency(stay.plan.rate)}</td>
            <td className="px-2 py-2 text-right font-mono font-semibold">
              {formatCurrency(bill?.baseAmount || stay.totalAmount)}
            </td>
          </tr>
          {bill && bill.overtimeHours > 0 && (
            <tr>
              <td className="px-2 py-2">Overtime Extension ({bill.overtimeHours} hrs)</td>
              <td className="px-2 py-2 text-center font-mono text-slate-500">996311</td>
              <td className="px-2 py-2 text-right">₹{stay.plan.overtimeRate || 200}/hr</td>
              <td className="px-2 py-2 text-right font-mono font-semibold">
                {formatCurrency(bill.overtimeAmount)}
              </td>
            </tr>
          )}
          {stay.extraCharges.map((ex) => (
            <tr key={ex.id}>
              <td className="px-2 py-2">{ex.label}</td>
              <td className="px-2 py-2 text-center font-mono text-slate-500">{hotel.sacCodeFood || "996331"}</td>
              <td className="px-2 py-2 text-right">—</td>
              <td className="px-2 py-2 text-right font-mono font-semibold">{formatCurrency(ex.amount)}</td>
            </tr>
          ))}
          {bill && bill.discount > 0 && (
            <tr className="bg-emerald-50/40 text-emerald-700">
              <td className="px-2 py-2 font-medium">Special Management Rebate / Discount</td>
              <td className="px-2 py-2 text-center">—</td>
              <td className="px-2 py-2 text-right">—</td>
              <td className="px-2 py-2 text-right font-mono font-semibold">- {formatCurrency(bill.discount)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-bold">
            <td colSpan={3} className="px-2 py-2 text-right">
              Folio Total:
            </td>
            <td className="px-2 py-2 text-right font-mono text-sm font-extrabold text-slate-950">
              {formatCurrency(stay.totalAmount)}
            </td>
          </tr>
          {stay.advanceAmount > 0 && (
            <tr className="text-slate-600">
              <td colSpan={3} className="px-2 py-1 text-right">
                Less: Advance Deposit ({stay.advanceMode || "CASH"}):
              </td>
              <td className="px-2 py-1 text-right font-mono text-slate-700">- {formatCurrency(stay.advanceAmount)}</td>
            </tr>
          )}
          {stay.paidAmount > stay.advanceAmount && (
            <tr className="text-slate-600">
              <td colSpan={3} className="px-2 py-1 text-right">
                Settlement Payment:
              </td>
              <td className="px-2 py-1 text-right font-mono text-slate-700">
                - {formatCurrency(stay.paidAmount - stay.advanceAmount)}
              </td>
            </tr>
          )}
          <tr className="border-t border-slate-300 font-bold text-brand-900">
            <td colSpan={3} className="px-2 py-2 text-right text-sm">
              {refundDue > 0 ? "Refund Due:" : "Net Balance Payable:"}
            </td>
            <td className="px-2 py-2 text-right font-mono text-base font-extrabold text-rose-600">
              {formatCurrency(refundDue > 0 ? refundDue : balanceDue)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Taxes & QR info */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>
            GST {taxPercent}% Schedule Compliant · CGST {(taxPercent / 2).toFixed(1)}% + SGST {(taxPercent / 2).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <QrCode className="size-4 text-slate-700" />
          <span>
            UPI VPA: <strong className="font-mono text-slate-800">{hotel.upiId}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
