import { useState } from "react";
import { MenuItem, Select, TextField } from "@mui/material";
import { presetRange, type DateRangePreset, type DateRangeValue } from "./dateRangePresets";

const OPTIONS: { id: DateRangePreset; label: string }[] = [
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
  defaultPreset?: DateRangePreset;
}

const InBetweenDateSearch = ({ value, onChange, defaultPreset = "last7" }: Props) => {
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        size="small"
        value={preset}
        onChange={(e) => {
          const p = e.target.value as DateRangePreset;
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
