import { CheckCircle2, Clock, Package, UserCheck } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard";

interface LostFoundKpiCardsProps {
  totalCount: number;
  securedCount: number;
  notifiedCount: number;
  claimedCount: number;
}

export function LostFoundKpiCards({
  totalCount,
  securedCount,
  notifiedCount,
  claimedCount,
}: LostFoundKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Registered"
        value={totalCount}
        note="All logged custody articles"
        icon={<Package className="size-5" />}
        tone="brand"
      />
      <MetricCard
        label="Secured in Locker"
        value={securedCount}
        note="Under housekeeping vault custody"
        icon={<Clock className="size-5" />}
        tone="neutral"
      />
      <MetricCard
        label="Awaiting Pickup"
        value={notifiedCount}
        note="Guest contact established"
        icon={<UserCheck className="size-5" />}
        tone="warning"
      />
      <MetricCard
        label="Returned to Guest"
        value={claimedCount}
        note="Verified handover completed"
        icon={<CheckCircle2 className="size-5" />}
        tone="positive"
      />
    </div>
  );
}
