import type { Dispatch, SetStateAction } from "react";
import SectionBox from "../../../components/ui/container/SectionBox";
import ReservationBookingTable from "./ReservationBookingTable";
import type { Reservation, RoomType } from "../../../utils/interfaces/Interface";
import { MdSearch } from "react-icons/md";

interface ReservationListViewProps {
  reservations: Reservation[];
  roomTypes: RoomType[];
  filterStatus: string;
  setFilterStatus: Dispatch<SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  onCheckIn: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
}

const FILTERS = ["ALL", "CONFIRMED", "CHECKED_IN", "CANCELLED"];

export default function ReservationListView(props: ReservationListViewProps) {
  const { reservations, roomTypes, filterStatus, setFilterStatus, searchQuery, setSearchQuery, onCheckIn, onCancel } = props;

  return (
    <SectionBox className="!p-4 sm:!p-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {FILTERS.map((status) => (
            <button key={status} type="button" onClick={() => setFilterStatus(status)} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${filterStatus === status ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}>
              {status === "ALL" ? "All bookings" : status === "CHECKED_IN" ? "Checked in" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-72">
          <MdSearch className="text-slate-400" size={16} aria-hidden="true" />
          <input type="search" placeholder="Search guest, phone, booking" aria-label="Search bookings" className="w-full bg-transparent text-sm text-slate-900 outline-none" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </label>
      </div>
      <ReservationBookingTable reservations={reservations} roomTypes={roomTypes} onCheckIn={onCheckIn} onCancel={onCancel} />
    </SectionBox>
  );
}
