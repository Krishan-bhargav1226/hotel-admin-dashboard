import { useEffect, useState } from "react";

// Shared broadcast timer across all active components to prevent multiple redundant setIntervals
let sharedNow = Date.now();
const listeners = new Set<(time: number) => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function notify() {
  sharedNow = Date.now();
  listeners.forEach((listener) => listener(sharedNow));
}

function startTimer() {
  if (!timerId) {
    timerId = setInterval(notify, 15000);
  }
}

function stopTimer() {
  if (timerId && listeners.size === 0) {
    clearInterval(timerId);
    timerId = null;
  }
}

/** Re-renders on shared ticks (15s) so running timers, bills, and timestamps stay live without running multiple intervals. */
export const useNow = (_intervalMs?: number): number => {
  void _intervalMs;
  const [now, setNow] = useState(() => sharedNow);

  useEffect(() => {
    listeners.add(setNow);
    startTimer();
    return () => {
      listeners.delete(setNow);
      stopTimer();
    };
  }, []);

  return now;
};
