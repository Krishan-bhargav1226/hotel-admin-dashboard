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
  const overdueMinutes = active && stay.expectedCheckOutAt ? dayjs(now).diff(dayjs(stay.expectedCheckOutAt), "minute") : 0;
  const overdue = active && !!stay.expectedCheckOutAt && overdueMinutes > (stay.plan.graceMinutes ?? 0);
  return <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-lg">
    <StayCardHeader stay={stay} room={room} active={active} />
    <div className="flex flex-1 flex-col justify-between p-4"><StayCardSummary stay={stay} room={room} bill={bill} active={active} overdue={overdue} overdueMinutes={overdueMinutes} /><StayCardActions active={active} onView={onView} onRoomService={onRoomService} onCheckout={onCheckout} onDelete={onDelete} /></div>
  </article>;
}
