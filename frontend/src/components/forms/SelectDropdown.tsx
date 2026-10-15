import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useField, useFormikContext } from "formik";

export interface SelectOption {
  id: string;
  name: string;
  hint?: string;
}

interface Props {
  name: string;
  label: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  helper?: string;
  onValueChange?: (value: string | string[]) => void;
}

/** Searchable dropdown wired to Formik. Single => string, multiple => string[]. */
export const SearchableSelectDropdown: React.FC<Props> = ({
  name,
  label,
  options,
  disabled,
  required = false,
  multiple = false,
  helper,
  onValueChange,
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const showError = Boolean(meta.touched && meta.error);

  const selected = multiple
    ? options.filter((o) => Array.isArray(field.value) && field.value.includes(o.id))
    : options.find((o) => o.id === field.value) ?? null;

  return (
    <Autocomplete
      multiple={multiple}
      disabled={disabled}
      value={selected as SelectOption & SelectOption[]}
      options={options}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_e, v) => {
        const val = multiple
          ? (v as SelectOption[]).map((x) => x.id)
          : (v as SelectOption | null)?.id ?? "";
        setFieldValue(name, val, true);
        onValueChange?.(val);
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <div className="text-sm font-medium">{option.name}</div>
            {option.hint && <div className="text-xs text-gray-500">{option.hint}</div>}
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          className="!mb-2"
          label={label}
          size="small"
          error={showError}
          helperText={showError ? String(meta.error) : helper ?? ""}
          slotProps={{
            inputLabel: { required, sx: { "& .MuiInputLabel-asterisk": { color: "red" } } },
          }}
        />
      )}
    />
  );
};
