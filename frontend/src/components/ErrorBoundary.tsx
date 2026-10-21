import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error in ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = import.meta.env.BASE_URL;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl dark:border-rose-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertTriangle className="size-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              An unexpected error occurred in this section. Your hotel records and in-memory data remain safe.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >
                <RefreshCw className="size-4" /> Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Home className="size-4" /> Front Desk
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Technical details
                </summary>
                <pre className="mt-2 max-h-36 overflow-auto rounded-lg bg-slate-100 p-2 text-[11px] font-mono text-rose-700 dark:bg-slate-950 dark:text-rose-400">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
