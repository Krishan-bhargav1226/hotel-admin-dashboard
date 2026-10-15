import { useEffect, useMemo, useState } from "react";

export const useClientPagination = <T,>(items: T[], initialSize = 10) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (pageNumber > totalPages) setPageNumber(totalPages);
  }, [pageNumber, totalPages]);

  const pageItems = useMemo(
    () => items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    [items, pageNumber, pageSize]
  );

  return {
    pageItems,
    pageNumber,
    pageSize,
    totalPages,
    totalCount: items.length,
    offset: (pageNumber - 1) * pageSize,
    setPageNumber,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPageNumber(1);
    },
    reset: () => setPageNumber(1),
  };
};
