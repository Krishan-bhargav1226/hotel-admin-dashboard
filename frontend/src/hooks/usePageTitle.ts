import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Hotel Admin PMS` : "Hotel Admin Dashboard";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
