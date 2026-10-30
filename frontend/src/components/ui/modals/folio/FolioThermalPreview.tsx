import { formatCurrency } from "../../../../utils/helper/helper";
import { formatDateTime } from "../../../../utils/date/dateUtils";
import type { HotelSettings, Stay } from "../../../../utils/interfaces/Interface";

interface FolioThermalPreviewProps {
  stay: Stay;
  hotel: HotelSettings;
  invNumber: string;
}

export function FolioThermalPreview({ stay, hotel, invNumber }: FolioThermalPreviewProps) {
  const totalPaid = stay.paidAmount || stay.advanceAmount || 0;
  const balanceDue = stay.dueAmount || Math.max(0, stay.totalAmount - totalPaid);

  return (
    <div className="mx-auto max-w-xs rounded-xl border border-slate-300 bg-white p-4 font-mono text-xs text-slate-900 shadow-sm">
      <div className="text-center text-sm font-bold">{hotel.chainName || "GRAND HORIZON"}</div>
      <div className="text-center font-bold">{hotel.hotelName}</div>
      <div className="text-center text-[10px] text-slate-500">{hotel.address}</div>
      <div className="text-center text-[10px] text-slate-500">GSTIN: {hotel.gstin}</div>
      <div className="my-2 border-t-2 border-slate-900" />
      <div className="text-center font-bold">TAX INVOICE / CASH SLIP</div>
      <div className="my-1 border-t border-dashed border-slate-300" />
      <div className="flex justify-between">
        <span>Receipt:</span>
        <strong>{invNumber}</strong>
      </div>
      <div className="flex justify-between">
        <span>Guest:</span>
        <strong>{stay.guestName}</strong>
      </div>
      <div className="flex justify-between">
        <span>Room:</span>
        <strong>{stay.roomNumber}</strong>
      </div>
      <div className="flex justify-between">
        <span>Check-in:</span>
        <span>{formatDateTime(stay.checkInAt)}</span>
      </div>
      <div className="my-2 border-t border-dashed border-slate-300" />
      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL:</span>
        <span>{formatCurrency(stay.totalAmount)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Adv Paid:</span>
        <span>- {formatCurrency(stay.advanceAmount)}</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-rose-600">
        <span>BALANCE DUE:</span>
        <span>{formatCurrency(balanceDue)}</span>
      </div>
      <div className="my-2 border-t-2 border-slate-900" />
      <div className="text-center text-[10px] font-bold">THANK YOU! VISIT AGAIN</div>
    </div>
  );
}
