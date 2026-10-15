import { useEffect, useState } from "react";

/** Re-renders every `intervalMs` so running timers / bills stay live. */
export const useNow = (intervalMs = 30000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
};
