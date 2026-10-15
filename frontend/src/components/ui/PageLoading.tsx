import { Skeleton } from "./skeleton";

export default function PageLoading() {
  return (
    <div role="status" aria-label="Loading page" className="mx-auto min-h-[calc(100dvh-10rem)] w-full max-w-[1440px]">
      <span className="sr-only">Loading page content</span>
      <div className="mb-6 border-b border-[var(--border)] pb-5">
        <Skeleton className="h-8 w-56 max-w-[70%] rounded-lg" />
        <Skeleton className="mt-3 h-4 w-80 max-w-[90%] rounded-md" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 xl:gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-panel sm:p-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-4 h-7 w-1/2" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
