import dayjs from "dayjs";

// "24 Mar"
export const formatDate = (dateString: string): string =>
  dayjs(dateString).format("DD MMM");

// "24 Mar 2025"
export const formatFullDate = (dateString?: string | null): string => {
  if (!dateString) return "-";
  const d = dayjs(dateString);
  return d.isValid() ? d.format("DD MMM YYYY") : "N/A";
};

// "02:30 PM"
export const formatTime = (dateString?: string | null): string => {
  if (!dateString) return "-";
  const d = dayjs(dateString);
  return d.isValid() ? d.format("hh:mm A") : "N/A";
};

// "24 Mar 2025, 02:30 PM"
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "-";
  const d = dayjs(dateString);
  return d.isValid() ? d.format("DD MMM YYYY, hh:mm A") : "N/A";
};

/** ISO -> value for <input type="datetime-local"> */
export const toLocalInput = (iso: string): string =>
  dayjs(iso).format("YYYY-MM-DDTHH:mm");

/** <input type="datetime-local"> value -> ISO */
export const fromLocalInput = (value: string): string =>
  dayjs(value).toISOString();
