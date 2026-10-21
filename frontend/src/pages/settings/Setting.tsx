import { useState } from "react";
import { BedDouble, Building, Database, Palette, Receipt } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import HotelInfo from "./hotel-info/HotelInfo";
import RoomType from "./room-type/RoomType";
import RatePlan from "./rate-plan/RatePlan";
import Backup from "./backup/Backup";
import BrandSettings from "./brand/BrandSettings";

const SETTING_TABS = [
  { id: 0, label: "Rate Plans & Tariffs", icon: Receipt },
  { id: 1, label: "Room Types & Pricing", icon: BedDouble },
  { id: 2, label: "Hotel Info & Profile", icon: Building },
  { id: 3, label: "Chain Branding & Folio Design", icon: Palette },
  { id: 4, label: "Data Backup & Reset", icon: Database },
];

const Setting = () => {
  const [tab, setTab] = useState(0);

  return (
    <MainContainer>
      <PageTitle
        title={APP_TEXT.titles.SETTINGS}
        subtitle="Manage hotel profile, room inventory tiers, rate plans, and system data backups."
      />
      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-5 inline-flex flex-wrap gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-slate-800 dark:bg-slate-900"
      >
        {SETTING_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                isActive
                  ? "bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div>
        {tab === 0 && <RatePlan />}
        {tab === 1 && <RoomType />}
        {tab === 2 && <HotelInfo />}
        {tab === 3 && <BrandSettings />}
        {tab === 4 && <Backup />}
      </div>
    </MainContainer>
  );
};

export default Setting;
