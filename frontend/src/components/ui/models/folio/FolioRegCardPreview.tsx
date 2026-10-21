import { formatCurrency } from "../../../../utils/helper/helper";
import { idTypeName } from "../../../../utils/helper/constants";
import type { HotelSettings, Stay } from "../../../../utils/interfaces/Interface";

interface FolioRegCardPreviewProps {
  stay: Stay;
  hotel: HotelSettings;
}

export function FolioRegCardPreview({ stay, hotel }: FolioRegCardPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 text-xs text-slate-900 shadow-sm sm:p-8">
      <div className="border-b-2 border-slate-900 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Official Check-In</span>
        <h3 className="text-lg font-extrabold">{hotel.hotelName}</h3>
        <p className="text-[11px] text-slate-500">
          {hotel.address} · Phone: {hotel.phone}
        </p>
        <span className="mt-2 inline-block rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Guest Registration Card
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded border border-slate-200 p-2.5">
          <div className="text-[10px] font-bold uppercase text-slate-400">Guest Name</div>
          <div className="text-sm font-bold text-slate-900">{stay.guestName}</div>
        </div>
        <div className="rounded border border-slate-200 p-2.5">
          <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Room</div>
          <div className="font-mono text-sm font-bold text-brand-800">
            Room {stay.roomNumber} ({stay.roomTypeName})
          </div>
        </div>
        <div className="rounded border border-slate-200 p-2.5">
          <div className="text-[10px] font-bold uppercase text-slate-400">Phone & ID</div>
          <div className="font-semibold">
            {stay.guestPhone} · {idTypeName(stay.guestIdType)}
          </div>
        </div>
        <div className="rounded border border-slate-200 p-2.5">
          <div className="text-[10px] font-bold uppercase text-slate-400">Rate Plan</div>
          <div className="font-semibold">
            {stay.plan.name} ({formatCurrency(stay.plan.rate)})
          </div>
        </div>
      </div>

      <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
        <strong>Declaration:</strong> I agree to abide by all hotel policies, maintain room decorum, and vacate the
        room by 11:00 AM on check-out date. The hotel is not responsible for valuables left in rooms.
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs">
        <div className="border-t border-slate-800 pt-2 font-bold">Guest Signature</div>
        <div className="border-t border-slate-800 pt-2 font-bold">Front Desk Executive</div>
      </div>
    </div>
  );
}
