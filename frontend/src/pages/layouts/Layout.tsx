import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { canAccessPath, useDeskRole } from "../../utils/access/deskRole";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { TooltipProvider } from "../../components/ui/tooltip";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import Breadcrumbs from "./Breadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";

const drawerWidthOpen = 248;
const drawerWidthClosed = 76;
const motionEase = [0.22, 1, 0.36, 1] as const;

export default function Layout() {
  const location = useLocation();
  const { role } = useDeskRole();
  const reduce = useReducedMotion();
  const allowed = canAccessPath(role, location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Online / Offline monitor (UX-16)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Per-page document.title sync (UX-14)
  useEffect(() => {
    const PATH_TITLES: Record<string, string> = {
      [AppEndPoints.DASHBOARD]: "Dashboard",
      [AppEndPoints.CHECK_IN]: "Guest Check-In",
      [AppEndPoints.STAY_LIST]: "Guest Stays",
      [AppEndPoints.ROOM_LIST]: "Rooms & Board",
      [AppEndPoints.GUEST_LIST]: "Guests Directory",
      [AppEndPoints.RESERVATIONS]: "Reservations",
      [AppEndPoints.HOUSEKEEPING]: "Housekeeping & Repairs",
      [AppEndPoints.POS_SERVICES]: "Room Service & POS",
      [AppEndPoints.STAFF_SHIFTS]: "Staff & Shifts",
      [AppEndPoints.EXPENSES]: "Operating Expenses",
      [AppEndPoints.REPORTS]: "Reports & Analytics",
      [AppEndPoints.SETTINGS]: "Settings",
    };

    const title = PATH_TITLES[location.pathname] || (location.pathname.startsWith("/stays/") ? "Stay Details" : location.pathname.startsWith("/guests/") ? "Guest Profile" : "Hotel Admin");
    document.title = `${title} | Hotel Admin PMS`;
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener (UX-15)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input") as HTMLInputElement | null;
        if (input) {
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <TooltipProvider>
      <div className="theme-root flex h-dvh bg-[var(--background)] font-sans text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <motion.aside
          className="no-print hidden h-dvh shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--card)] md:block"
          initial={false}
          animate={{ width: sidebarOpen ? drawerWidthOpen : drawerWidthClosed }}
          transition={{ duration: reduce ? 0 : 0.22, ease: motionEase }}
        >
          <Sidebar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
        </motion.aside>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div key="mobile-nav" className="md:hidden">
              <motion.button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 bg-slate-900/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[248px] border-r border-[var(--border)] bg-[var(--card)] shadow-xl"
                initial={{ x: reduce ? 0 : -280 }}
                animate={{ x: 0 }}
                exit={{ x: reduce ? 0 : -280 }}
                transition={{ duration: reduce ? 0 : 0.24, ease: motionEase }}
              >
                <Sidebar sidebarOpen onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={isMobile ? () => setMobileOpen(true) : () => setSidebarOpen((open) => !open)} />
          {isOffline && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-950 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200"
            >
              <WifiOff className="size-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <span>
                Offline Mode: Internet connection unavailable. Changes are safely cached locally in your browser.
              </span>
            </div>
          )}
          <main id="main-content" className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 xl:px-9 xl:py-8">
            <Breadcrumbs />
            {allowed ? (
              <ErrorBoundary>
                <motion.div
                  key={location.pathname}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: motionEase }}
                >
                  <Outlet />
                </motion.div>
              </ErrorBoundary>
            ) : (
              <Navigate to={AppEndPoints.DASHBOARD} replace />
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
