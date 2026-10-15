import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Images } from "../../components/constants/Image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { sidebarGroups, sidebarItems } from "./sidebarItems";
import { cn } from "../../lib/utils";

interface SidebarProps {
  sidebarOpen?: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}

export default function Sidebar({ sidebarOpen = true, onNavigate, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: settings } = useGetSettingsQuery();
  const hotelName = settings?.hotelName || "Grand Horizon";

  const isActive = (link: string) =>
    link === "/" ? location.pathname === "/" : location.pathname.startsWith(link);
  const groups = sidebarGroups
    .map((group) => ({ label: group, items: sidebarItems.filter((item) => item.group === group) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-[var(--card)] text-slate-900 dark:text-slate-100">
      <div className={cn("flex items-center gap-3 border-b border-[var(--border)] px-3 pt-4", sidebarOpen ? "pb-4" : "justify-center pb-3")}>
        <img src={Images.logo} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700" />
        {sidebarOpen ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight">{hotelName}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Hotel operations
            </p>
          </div>
        ) : null}
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 md:hidden dark:hover:bg-slate-800"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 pb-3 pt-2">
        <div className="space-y-2">
          {groups.map((group, groupIndex) => (
            <section key={group.label} aria-label={group.label} className={groupIndex > 0 ? "border-t border-[var(--border)] pt-2" : undefined}>
              {sidebarOpen ? (
                <h2 className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {group.label}
                </h2>
              ) : null}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.link);
                  const Icon = item.icon;
                  const button = (
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      aria-label={sidebarOpen ? undefined : item.label}
                      onClick={() => {
                        navigate(item.link);
                        onNavigate?.();
                      }}
                      className={cn(
                        "flex h-11 w-full items-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                        sidebarOpen ? "gap-3 px-3" : "justify-center",
                        active
                          ? "bg-brand-50 text-brand-800 shadow-sm ring-1 ring-inset ring-brand-200 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", active ? "text-brand-700 dark:text-brand-300" : "text-slate-400")} aria-hidden="true" />
                      {sidebarOpen ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                    </button>
                  );

                  return (
                    <li key={item.link}>
                      {sidebarOpen ? button : (
                        <Tooltip>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      {onToggle ? (
        <div className="border-t border-slate-200 p-2 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "flex h-11 w-full items-center rounded-lg text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-300 dark:hover:bg-slate-800",
              sidebarOpen ? "gap-3 px-3" : "justify-center"
            )}
          >
            {sidebarOpen ? <PanelLeftClose className="size-[18px]" aria-hidden="true" /> : <PanelLeftOpen className="size-[18px]" aria-hidden="true" />}
            {sidebarOpen ? <span>Collapse</span> : <span className="sr-only">Expand sidebar</span>}
          </button>
        </div>
      ) : null}
    </div>
  );
}
