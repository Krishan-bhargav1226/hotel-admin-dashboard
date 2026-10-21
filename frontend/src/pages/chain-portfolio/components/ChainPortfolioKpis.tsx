import { Building2, Coins, Key, TrendingUp } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard";
import { formatCurrency } from "../../../utils/helper/helper";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface ChainPortfolioKpisProps {
  properties: HotelProperty[];
}

export function ChainPortfolioKpis({ properties }: ChainPortfolioKpisProps) {
  const totalHotels = properties.length;
  const totalRooms = properties.reduce((acc, p) => acc + (p.roomCount || 0), 0);
  const avgOccupancy = totalHotels > 0
    ? Math.round(properties.reduce((acc, p) => acc + (p.occupancyRate || 0), 0) / totalHotels)
    : 0;
  const totalRevenue = properties.reduce(
    (acc, p) => acc + (p.dailyRevenue || (p.roomCount * (p.occupancyRate / 100) * 4500) || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Chain Properties"
        value={totalHotels}
        note="Active operating hotels in portfolio"
        icon={<Building2 className="size-5" />}
        tone="brand"
      />
      <MetricCard
        label="Total Room Inventory"
        value={`${totalRooms} Keys`}
        note="Across luxury, business & resort tiers"
        icon={<Key className="size-5" />}
        tone="neutral"
      />
      <MetricCard
        label="Portfolio Occupancy"
        value={`${avgOccupancy}%`}
        note="Chain-wide average in-house occupancy"
        icon={<TrendingUp className="size-5" />}
        tone="warning"
      />
      <MetricCard
        label="Consolidated Daily Revenue"
        value={formatCurrency(totalRevenue)}
        note="Combined turnover across all properties"
        icon={<Coins className="size-5" />}
        tone="positive"
      />
    </div>
  );
}
