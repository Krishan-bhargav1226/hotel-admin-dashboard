import { Compass, Home, LogIn, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { AppEndPoints } from "../../utils/route-endpoints/AppEndPoints";
import { Button } from "../../components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          <Compass className="size-9 animate-spin-slow" />
        </div>

        <span className="inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-xs font-bold text-brand-800 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
          HTTP 404 · Unknown Terminal Path
        </span>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Page or Route Not Found
        </h1>

        <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The requested operational resource or URL could not be located in this property management terminal.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" size="md">
            <Link to={AppEndPoints.DASHBOARD}>
              <Home className="size-4" />
              <span>Return to Dashboard</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="md">
            <Link to={AppEndPoints.CHECK_IN}>
              <LogIn className="size-4" />
              <span>Express Check-In</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="md">
            <Link to={AppEndPoints.POS_SERVICES}>
              <UtensilsCrossed className="size-4" />
              <span>Room Service POS</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
