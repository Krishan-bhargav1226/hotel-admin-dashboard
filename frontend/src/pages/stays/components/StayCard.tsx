import dayjs from "dayjs";
import type { BillBreakdown, Room, Stay } from "../../../utils/interfaces/Interface";
import StayCardHeader from "./StayCardHeader";
import StayCardSummary from "./StayCardSummary";
import StayCardActions from "./StayCardActions";

interface StayCardProps {
  stay: Stay;
  room?: Room;
  bill: BillBreakdown | null;
  now: number;
  onView: () => void;
  onRoomService: () => void;
  onCheckout: () => void;
  onDelete: () => void;
}

export default function StayCard({ stay, room, bill, now, onView, onRoomService, onCheckout, onDelete }: StayCardProps) {
  const active = stay.status === "ACTIVE";
  const minutesLeft = active && stay.expectedCheckOutAt ? dayjs(stay.expectedCheckOutAt).diff(dayjs(now), "minute") : null;
  const overdue = minutesLeft !== null && minutesLeft < -(stay.plan.graceMinutes ?? 0);
  const dueSoon = minutesLeft !== null && !overdue && minutesLeft <= 30;
  return <article className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-200 hover:shadow-lg ${overdue ? "border-rose-300 ring-2 ring-rose-200" : dueSoon ? "border-amber-300 ring-2 ring-amber-200" : "border-slate-200/90 hover:border-brand-200"}`}>
    <StayCardHeader stay={stay} room={room} active={active} />
    <div className="flex flex-1 flex-col justify-between p-4"><StayCardSummary stay={stay} room={room} bill={bill} active={active} overdue={overdue} dueSoon={dueSoon} minutesLeft={minutesLeft} /><StayCardActions active={active} onView={onView} onRoomService={onRoomService} onCheckout={onCheckout} onDelete={onDelete} /></div>
  </article>;
}
