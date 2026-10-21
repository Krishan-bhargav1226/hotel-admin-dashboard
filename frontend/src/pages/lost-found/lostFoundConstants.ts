import type { LostAndFoundCategory, LostAndFoundStatus } from "../../utils/interfaces/Interface";

export const CATEGORIES: { id: LostAndFoundCategory; label: string }[] = [
  { id: "ELECTRONICS", label: "Electronics" },
  { id: "VALUABLES", label: "Valuables & Wallets" },
  { id: "JEWELRY", label: "Jewelry & Watches" },
  { id: "DOCUMENTS", label: "Passports & IDs" },
  { id: "CLOTHING", label: "Clothing & Apparel" },
  { id: "OTHER", label: "Other Articles" },
];

export const STATUS_LABELS: Record<LostAndFoundStatus, { label: string; bg: string; text: string }> = {
  SECURED: {
    label: "Secured in Locker",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-300",
  },
  GUEST_NOTIFIED: {
    label: "Guest Notified",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
  },
  CLAIMED: {
    label: "Claimed & Returned",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  DISPOSED: {
    label: "Disposed (90+ Days)",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
  },
};
