import { Banknote, BedDouble, CalendarDays, CircleCheck, Sparkles, TrendingUp } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard";
import { FadeIn } from "../../../lib/motion";
import { formatCurrency } from "../../../utils/helper/helper";
import { AppEndPoints } from "../../../utils/rout-endpoints/AppEndPoints";

interface DashboardMetricsProps {
  occupancy: number;
  occupied: number;
  roomCount: number;
  available: number;
  todayRevenue: number;
  checkInsToday: number;
  departuresToday: number;
  runningTotal: number;
  activeStays: number;
  pendingDue: number;
  cleaning: number;
  confirmedBookings: number;
  onCleaning?: () => void;
}

export default function DashboardMetrics(props: DashboardMetricsProps) {
  const { occupancy, occupied, roomCount, available, todayRevenue, checkInsToday, departuresToday, runningTotal, activeStays, pendingDue, cleaning, confirmedBookings, onCleaning } = props;
  return <FadeIn className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 xl:gap-4">
    <MetricCard label="Occupancy" value={`${occupancy}%`} note={`${occupied} of ${roomCount} rooms occupied`} icon={<BedDouble className="size-4" aria-hidden="true" />} tone="brand" />
    <MetricCard label="Available rooms" value={available} note="Ready for check-in" icon={<CircleCheck className="size-4" aria-hidden="true" />} tone="positive" />
    <MetricCard label="Today's revenue" value={formatCurrency(todayRevenue)} note={`${checkInsToday} arrivals · ${departuresToday} departures`} icon={<TrendingUp className="size-4" aria-hidden="true" />} tone="brand" />
    <MetricCard label="Active folios" value={formatCurrency(runningTotal)} note={`${activeStays} current stays${pendingDue > 0 ? ` · ${formatCurrency(pendingDue)} due` : ""}`} icon={<Banknote className="size-4" aria-hidden="true" />} />
    <MetricCard label="Rooms to clean" value={cleaning} note={onCleaning ? "Shown on the room board" : "Open the housekeeping board"} icon={<Sparkles className="size-4" aria-hidden="true" />} tone="warning" to={onCleaning ? undefined : AppEndPoints.HOUSEKEEPING} onClick={onCleaning} />
    <MetricCard label="Confirmed bookings" value={confirmedBookings} note="View the reservation calendar" icon={<CalendarDays className="size-4" aria-hidden="true" />} tone="brand" to={AppEndPoints.RESERVATIONS} />
  </FadeIn>;
}
