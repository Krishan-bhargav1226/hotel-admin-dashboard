import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { TooltipProvider } from "../../components/ui/tooltip";
import Breadcrumbs from "./Breadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";

const drawerWidthOpen = 260;
const drawerWidthClosed = 72;
const motionEase = [0.22, 1, 0.36, 1] as const;

export default function Layout() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);

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

  return (
    <TooltipProvider>
      <div className="theme-root flex h-dvh bg-[var(--background)] font-sans text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <motion.aside
          className="no-print hidden h-dvh shrink-0 overflow-hidden border-r border-[var(--border)] md:block"
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
                className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[var(--border)] shadow-xl"
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
          <main id="main-content" className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <Breadcrumbs />
            <motion.div
              key={location.pathname}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: motionEase }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
