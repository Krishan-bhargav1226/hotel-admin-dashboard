import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";

interface Crumb {
  label: string;
  to?: string;
}

function crumbsFor(pathname: string): Crumb[] {
  if (pathname.startsWith("/stays/") && pathname !== AppEndPoints.STAY_LIST) {
    return [
      { label: APP_TEXT.sidebar.DASHBOARD, to: AppEndPoints.DASHBOARD },
      { label: APP_TEXT.sidebar.STAYS, to: AppEndPoints.STAY_LIST },
      { label: "Folio" },
    ];
  }
  if (pathname.startsWith("/guests/") && pathname !== AppEndPoints.GUEST_LIST) {
    return [
      { label: APP_TEXT.sidebar.DASHBOARD, to: AppEndPoints.DASHBOARD },
      { label: APP_TEXT.sidebar.GUESTS, to: AppEndPoints.GUEST_LIST },
      { label: "Profile" },
    ];
  }

  const current: Record<string, string> = {
    [AppEndPoints.DASHBOARD]: APP_TEXT.sidebar.DASHBOARD,
    [AppEndPoints.CHECK_IN]: APP_TEXT.sidebar.CHECK_IN,
    [AppEndPoints.RESERVATIONS]: APP_TEXT.sidebar.RESERVATIONS,
    [AppEndPoints.STAY_LIST]: APP_TEXT.sidebar.STAYS,
    [AppEndPoints.ROOM_LIST]: APP_TEXT.sidebar.ROOMS,
    [AppEndPoints.HOUSEKEEPING]: APP_TEXT.sidebar.HOUSEKEEPING,
    [AppEndPoints.POS_SERVICES]: APP_TEXT.sidebar.POS_SERVICES,
    [AppEndPoints.EXPENSES]: APP_TEXT.sidebar.EXPENSES,
    [AppEndPoints.STAFF_SHIFTS]: APP_TEXT.sidebar.STAFF_SHIFTS,
    [AppEndPoints.GUEST_LIST]: APP_TEXT.sidebar.GUESTS,
    [AppEndPoints.REPORTS]: APP_TEXT.sidebar.REPORTS,
    [AppEndPoints.SETTINGS]: APP_TEXT.sidebar.SETTINGS,
  };

  const label = current[pathname] ?? APP_TEXT.sidebar.DASHBOARD;
  if (pathname === AppEndPoints.DASHBOARD) return [{ label }];
  return [{ label: APP_TEXT.sidebar.DASHBOARD, to: AppEndPoints.DASHBOARD }, { label }];
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
              {crumb.to && !last ? (
                <Link to={crumb.to} className="rounded hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:text-white">
                  {crumb.label}
                </Link>
              ) : (
                <span className={last ? "font-medium text-slate-900 dark:text-slate-100" : undefined} aria-current={last ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
