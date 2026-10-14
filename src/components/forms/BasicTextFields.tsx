import { useField } from "formik";
import { InputAdornment, TextField } from "@mui/material";
import type { ReactNode } from "react";

interface TextInputProps {
  name: string;
  label: string;
  type?: "text" | "password" | "email" | "number" | "date" | "time" | "datetime-local" | "tel";
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  digitsOnly?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  helper?: string;
  onValueChange?: (value: string) => void;
}

export const TextInput = ({
  name,
  label,
  type = "text",
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  placeholder,
  autoFocus,
  maxLength,
  digitsOnly = false,
  prefix,
  suffix,
  helper,
  onValueChange,
}: TextInputProps) => {
  const [field, meta, helpers] = useField(name);
  const showError = Boolean(meta.touched && meta.error);
  const isDateLike = type === "date" || type === "time" || type === "datetime-local";

  return (
    <TextField
      {...field}
      value={field.value ?? ""}
      onChange={(e) => {
        let v = e.target.value;
        if (digitsOnly) v = v.replace(/\D/g, "");
        if (maxLength) v = v.slice(0, maxLength);
        helpers.setValue(v);
        onValueChange?.(v);
      }}
      label={label}
      type={type}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      fullWidth
      size="small"
      variant="outlined"
      error={showError}
      helperText={showError ? meta.error : helper ?? ""}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      className="!mb-2"
      slotProps={{
        inputLabel: {
          shrink: isDateLike || (field.value !== "" && field.value != null) || undefined,
          required,
        },
        htmlInput: {
          ...(type === "number" ? { min: 0 } : {}),
          ...(digitsOnly ? { inputMode: "numeric" } : {}),
        },
        input: {
          startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
          endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
        },
      }}
      sx={{ "& .MuiInputLabel-asterisk": { color: "red" } }}
    />
  );
};
