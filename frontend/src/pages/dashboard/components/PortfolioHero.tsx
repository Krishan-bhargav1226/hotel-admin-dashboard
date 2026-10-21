import { ArrowUpRight, BedDouble, Hotel, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface PortfolioHeroProps {
  propertyCount: number;
  roomCount: number;
  staffCount: number;
  onAddRooms: () => void;
  onAddHotel: () => void;
  onOpenFrontDesk?: () => void;
}

export default function PortfolioHero({
  propertyCount,
  roomCount,
  staffCount,
  onAddRooms,
  onAddHotel,
  onOpenFrontDesk,
}: PortfolioHeroProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-brand-700 bg-brand-700 p-5 text-white shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90">
            <Hotel className="size-3.5" aria-hidden="true" /> YOUR HOTEL PORTFOLIO
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl">
            A clear view of<br className="hidden sm:block" /> every stay.
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
            Keep your properties, rooms, revenue, and team in sync from one calm workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenFrontDesk ? (
            <Button size="sm" variant="outline" icon={ArrowUpRight} className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={onOpenFrontDesk}>
              Open front desk
            </Button>
          ) : null}
          <Button size="sm" variant="outline" icon={BedDouble} className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={onAddRooms}>
            Add rooms
          </Button>
          <Button size="sm" variant="secondary" icon={Plus} className="bg-white font-semibold text-brand-800 hover:bg-brand-50" onClick={onAddHotel}>
            Add hotel
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-4 text-xs text-white/75">
        <span><strong className="mr-1.5 text-base font-semibold text-white">{propertyCount}</strong> properties</span>
        <span><strong className="mr-1.5 text-base font-semibold text-white">{roomCount}</strong> rooms</span>
        <span><strong className="mr-1.5 text-base font-semibold text-white">{staffCount}</strong> team members</span>
      </div>
    </section>
  );
}
