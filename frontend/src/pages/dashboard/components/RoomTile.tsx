import dayjs from "dayjs";
import { cn } from "../../../lib/utils";
import type { DisplayRoomStatus } from "../../../components/ui/room/RoomStatusBadge";
import type { Room, RoomType, Stay } from "../../../utils/interfaces/Interface";
import { calculateBill } from "../../../utils/helper/billing";
import { billForStayRooms, stayRoomCount } from "../../../utils/helper/stayRooms";
import RoomTilePhoto from "./RoomTilePhoto";
import RoomTileDetails from "./RoomTileDetails";
import RoomTileActions from "./RoomTileActions";

export interface RoomHold {
  guestName: string;
  guestPhone: string;
}

interface RoomTileProps {
  room: Room;
  roomTypeName: string;
  roomType?: RoomType;
  stay?: Stay;
  reservation?: RoomHold;
  now: number;
  onCheckIn: () => void;
  onOpenStay: () => void;
  onCheckOut: () => void;
  onOrderService?: () => void;
  onSetStatus: (status: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => void;
}

const DUE_SOON_MINUTES = 30;

export default function RoomTile(props: RoomTileProps) {
  const { room, roomTypeName, roomType, stay, reservation, now, onCheckIn, onOpenStay, onCheckOut, onOrderService, onSetStatus } = props;
  const running = stay?.status === "ACTIVE"
    ? billForStayRooms(
        calculateBill({ plan: stay.plan, checkInAt: stay.checkInAt, checkOutAt: new Date(now).toISOString(), expectedCheckOutAt: stay.expectedCheckOutAt, extraCharges: stay.extraCharges, discount: stay.discount, taxPercent: stay.taxPercent }),
        stayRoomCount(stay),
      )
    : null;
  const minutesLeft = stay?.expectedCheckOutAt ? dayjs(stay.expectedCheckOutAt).diff(dayjs(now), "minute") : null;
  const isOverdue = minutesLeft !== null && minutesLeft < -(stay?.plan.graceMinutes ?? 0);
  const dueSoon = minutesLeft !== null && !isOverdue && minutesLeft <= DUE_SOON_MINUTES;
  const displayStatus: DisplayRoomStatus = room.status === "AVAILABLE" && reservation ? "RESERVED" : room.status;

  return <article className={cn(
    "group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border bg-[var(--card)] shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
    isOverdue ? "border-rose-300 ring-2 ring-rose-200" : dueSoon ? "border-amber-300 ring-2 ring-amber-200" : "border-[var(--border)] hover:border-brand-200",
  )}>
    <RoomTilePhoto room={room} roomTypeName={roomTypeName} roomType={roomType} displayStatus={displayStatus} />
    <RoomTileDetails room={room} stay={stay} reservation={reservation} running={running} isOverdue={isOverdue} dueSoon={dueSoon} minutesLeft={minutesLeft} />
    <div className="px-4 pb-4"><RoomTileActions room={room} onCheckIn={onCheckIn} onOpenStay={onOpenStay} onCheckOut={onCheckOut} onOrderService={onOrderService} onSetStatus={onSetStatus} /></div>
  </article>;
}
