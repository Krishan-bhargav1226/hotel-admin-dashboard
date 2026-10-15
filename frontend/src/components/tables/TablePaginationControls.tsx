interface PageEvent {
  target: { value: string };
}

interface Props {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onRowsPerPageChange: (event: PageEvent) => void;
}

const TablePaginationControls = ({
  pageNumber,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: Props) => {
  const pageSizeOptions = [5, 10, 25, 50, totalCount].filter((size, index, all) => all.indexOf(size) === index && size > 0);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - pageNumber) <= 1
  );

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-300">
      <label className="inline-flex items-center gap-2">
        Rows per page
        <select
          value={String(pageSize)}
          onChange={(event) => onRowsPerPageChange(event)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size === totalCount ? `All (${totalCount})` : size}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1, pageSize)}
          className="h-8 rounded-lg px-2.5 font-medium hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        {pages.map((page, index) => {
          const prev = pages[index - 1];
          return (
            <span key={page} className="inline-flex items-center">
              {prev && page - prev > 1 ? <span className="px-1 text-slate-400">…</span> : null}
              <button
                type="button"
                onClick={() => onPageChange(page, pageSize)}
                aria-current={page === pageNumber ? "page" : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 font-semibold ${
                  page === pageNumber
                    ? "bg-brand-500 text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          disabled={pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1, pageSize)}
          className="h-8 rounded-lg px-2.5 font-medium hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TablePaginationControls;
