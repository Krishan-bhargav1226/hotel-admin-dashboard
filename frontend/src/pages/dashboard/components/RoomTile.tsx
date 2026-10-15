import dayjs from "dayjs";
import type { Room, Stay } from "../../../utils/interfaces/Interface";
import { calculateBill } from "../../../utils/helper/billing";
import RoomTilePhoto from "./RoomTilePhoto";
import RoomTileDetails from "./RoomTileDetails";
import RoomTileActions from "./RoomTileActions";

interface RoomTileProps {
  room: Room;
  roomTypeName: string;
  stay?: Stay;
  now: number;
  onCheckIn: () => void;
  onOpenStay: () => void;
  onCheckOut: () => void;
  onOrderService?: () => void;
  onSetStatus: (status: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => void;
}

export default function RoomTile(props: RoomTileProps) {
  const { room, roomTypeName, stay, now, onCheckIn, onOpenStay, onCheckOut, onOrderService, onSetStatus } = props;
  const running = stay?.status === "ACTIVE" ? calculateBill({ plan: stay.plan, checkInAt: stay.checkInAt, checkOutAt: new Date(now).toISOString(), expectedCheckOutAt: stay.expectedCheckOutAt, extraCharges: stay.extraCharges, discount: stay.discount, taxPercent: stay.taxPercent }) : null;
  const overdueMin = stay?.expectedCheckOutAt ? dayjs(now).diff(dayjs(stay.expectedCheckOutAt), "minute") : 0;
  const isOverdue = !!stay?.expectedCheckOutAt && overdueMin > (stay.plan.graceMinutes ?? 0);

  return <article className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
    <RoomTilePhoto room={room} roomTypeName={roomTypeName} />
    <RoomTileDetails room={room} stay={stay} running={running} isOverdue={isOverdue} overdueMin={overdueMin} />
    <div className="px-4 pb-4"><RoomTileActions room={room} onCheckIn={onCheckIn} onOpenStay={onOpenStay} onCheckOut={onCheckOut} onOrderService={onOrderService} onSetStatus={onSetStatus} /></div>
  </article>;
}
