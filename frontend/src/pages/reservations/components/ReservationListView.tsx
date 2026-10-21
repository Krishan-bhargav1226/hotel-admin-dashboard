import type { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";
import ReservationBookingTable from "./ReservationBookingTable";
import { useClientPagination } from "../../../hooks/useClientPagination";
import TablePaginationControls from "../../../components/tables/TablePaginationControls";
import type { Reservation, RoomType } from "../../../utils/interfaces/Interface";

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
  const pg = useClientPagination(reservations, 10);

  return (
    <SectionBox className="!p-4 sm:!p-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setFilterStatus(status);
                pg.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
                filterStatus === status
                  ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {status === "ALL" ? "All bookings" : status === "CHECKED_IN" ? "Checked in" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-72 dark:border-slate-700 dark:bg-slate-900">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search guest, phone, booking"
            aria-label="Search bookings"
            className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              pg.reset();
            }}
          />
        </label>
      </div>
      <ReservationBookingTable reservations={pg.pageItems} roomTypes={roomTypes} onCheckIn={onCheckIn} onCancel={onCancel} />
      {reservations.length > 0 && (
        <TablePaginationControls
          pageNumber={pg.pageNumber}
          pageSize={pg.pageSize}
          totalPages={pg.totalPages}
          totalCount={pg.totalCount}
          onPageChange={(p: number) => pg.setPageNumber(p)}
          onRowsPerPageChange={(e: { target: { value: string } }) => pg.setPageSize(parseInt(e.target.value, 10))}
        />
      )}
    </SectionBox>
  );
}
