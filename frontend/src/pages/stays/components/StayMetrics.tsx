import { IndianRupee, KeyRound, Users, AlertTriangle } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard";
import { formatCurrency } from "../../../utils/helper/helper";

interface StayMetricsProps {
  activeRooms: number;
  guestCount: number;
  liveFolioTotal: number;
  departures: number;
  onShowDepartures: () => void;
}

export default function StayMetrics({ activeRooms, guestCount, liveFolioTotal, departures, onShowDepartures }: StayMetricsProps) {
  return <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
    <MetricCard label="Occupied rooms" value={activeRooms} note="Rooms with an active stay" icon={<KeyRound size={16} aria-hidden="true" />} tone="brand" />
    <MetricCard label="Guests in-house" value={guestCount} note="Current guest headcount" icon={<Users size={16} aria-hidden="true" />} tone="positive" />
    <MetricCard label="Running folios" value={formatCurrency(liveFolioTotal)} note="Current stay totals" icon={<IndianRupee size={16} aria-hidden="true" />} />
    <MetricCard label="Departures today" value={departures} note={departures === 0 ? "No departures need review" : "Review today's check-outs"} icon={<AlertTriangle size={16} aria-hidden="true" />} tone="warning" onClick={onShowDepartures} />
  </div>;
}
