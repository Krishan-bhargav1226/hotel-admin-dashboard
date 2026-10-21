import { useEffect } from "react";

/**
 * Warns counter staff if they try to refresh or navigate away while check-in data has been entered.
 */
export function useUnsavedWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "Check-in data bhara hua hai. Kya aap bina check-in ke bahar jana chahte hain?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
}
