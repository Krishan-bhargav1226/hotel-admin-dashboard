import { useState } from "react";
import { MenuItem, Select, TextField } from "@mui/material";
import dayjs from "dayjs";

export interface DateRangeValue {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

type Preset = "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth" | "all" | "custom";

const fmt = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");

export const presetRange = (preset: Preset): DateRangeValue => {
  const t = dayjs();
  switch (preset) {
    case "today": return { from: fmt(t), to: fmt(t) };
    case "yesterday": return { from: fmt(t.subtract(1, "day")), to: fmt(t.subtract(1, "day")) };
    case "last7": return { from: fmt(t.subtract(6, "day")), to: fmt(t) };
    case "thisMonth": return { from: fmt(t.startOf("month")), to: fmt(t) };
    case "lastMonth": {
      const l = t.subtract(1, "month");
      return { from: fmt(l.startOf("month")), to: fmt(l.endOf("month")) };
    }
    case "all": return { from: "", to: "" };
    default: return { from: fmt(t.subtract(29, "day")), to: fmt(t) };
  }
};

const OPTIONS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom range" },
];

interface Props {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  defaultPreset?: Preset;
}

const InBetweenDateSearch = ({ value, onChange, defaultPreset = "last7" }: Props) => {
  const [preset, setPreset] = useState<Preset>(defaultPreset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        size="small"
        value={preset}
        onChange={(e) => {
          const p = e.target.value as Preset;
          setPreset(p);
          if (p !== "custom") onChange(presetRange(p));
        }}
        sx={{ minWidth: 150, bgcolor: "white" }}
      >
        {OPTIONS.map((o) => (
          <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
        ))}
      </Select>
      {preset === "custom" && (
        <>
          <TextField
            size="small" type="date" label="From" value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ bgcolor: "white" }}
          />
          <TextField
            size="small" type="date" label="To" value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ bgcolor: "white" }}
          />
        </>
      )}
    </div>
  );
};

export default InBetweenDateSearch;
