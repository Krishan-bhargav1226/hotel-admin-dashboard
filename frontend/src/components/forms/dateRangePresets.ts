import dayjs from "dayjs";

export interface DateRangeValue {
  from: string;
  to: string;
}

export type DateRangePreset = "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth" | "all" | "custom";

const formatDate = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");

export const presetRange = (preset: DateRangePreset): DateRangeValue => {
  const today = dayjs();
  switch (preset) {
    case "today": return { from: formatDate(today), to: formatDate(today) };
    case "yesterday": return { from: formatDate(today.subtract(1, "day")), to: formatDate(today.subtract(1, "day")) };
    case "last7": return { from: formatDate(today.subtract(6, "day")), to: formatDate(today) };
    case "thisMonth": return { from: formatDate(today.startOf("month")), to: formatDate(today) };
    case "lastMonth": {
      const lastMonth = today.subtract(1, "month");
      return { from: formatDate(lastMonth.startOf("month")), to: formatDate(lastMonth.endOf("month")) };
    }
    case "all": return { from: "", to: "" };
    default: return { from: formatDate(today.subtract(29, "day")), to: formatDate(today) };
  }
};
