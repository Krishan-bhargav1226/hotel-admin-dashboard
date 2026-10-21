import { Coins, Percent, TrendingUp, Users } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard";
import { formatCurrency } from "../../../utils/helper/helper";

interface AuditKpiCardsProps {
  occupancyPercent: number;
  occupiedRoomsCount: number;
  totalRoomsCount: number;
  grossRevenue: number;
  totalRoomRevenue: number;
  adr: number;
  revPar: number;
}

export function AuditKpiCards({
  occupancyPercent,
  occupiedRoomsCount,
  totalRoomsCount,
  grossRevenue,
  totalRoomRevenue,
  adr,
  revPar,
}: AuditKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="House Occupancy"
        value={`${occupancyPercent}%`}
        note={`${occupiedRoomsCount} / ${totalRoomsCount} Rooms Occupied`}
        icon={<Users className="size-5" />}
        tone="brand"
      />
      <MetricCard
        label="Gross Daily Revenue"
        value={formatCurrency(grossRevenue)}
        note={`Room Base: ${formatCurrency(totalRoomRevenue)}`}
        icon={<Coins className="size-5" />}
        tone="positive"
      />
      <MetricCard
        label="ADR (Average Daily Rate)"
        value={formatCurrency(adr)}
        note="Per occupied room night"
        icon={<TrendingUp className="size-5" />}
        tone="neutral"
      />
      <MetricCard
        label="RevPAR"
        value={formatCurrency(revPar)}
        note="Revenue per available room"
        icon={<Percent className="size-5" />}
        tone="warning"
      />
    </div>
  );
}
