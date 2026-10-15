import type { BookingSource, ReservationStatus } from "../../../utils/interfaces/Interface";

export const SOURCE_LABELS: Record<BookingSource, { label: string; color: string }> = {
  DIRECT_WALKIN: { label: "Direct Walk-in", color: "#10B981" },
  WEBSITE: { label: "Hotel Website", color: "#6366F1" },
  BOOKING_COM: { label: "Booking.com", color: "#003580" },
  MAKEMYTRIP: { label: "MakeMyTrip", color: "#EF4444" },
  AGODA: { label: "Agoda", color: "#8B5CF6" },
  PHONE: { label: "Phone Inquiry", color: "#F59E0B" },
  CORPORATE: { label: "Corporate Desk", color: "#0D9488" },
};

export const STATUS_COLORS: Record<ReservationStatus, "success" | "info" | "error" | "default"> = {
  CONFIRMED: "info",
  CHECKED_IN: "success",
  CANCELLED: "error",
  NO_SHOW: "default",
};
