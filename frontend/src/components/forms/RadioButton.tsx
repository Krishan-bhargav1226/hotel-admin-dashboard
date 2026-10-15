import React from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { useField } from "formik";

interface Option {
  id: string | number;
  name: string;
}

interface RadioButtonProps {
  name: string;
  label?: string;
  options: Option[];
  row?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  label,
  options,
  row = false,
  disabled = false,
  onValueChange,
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <FormControl component="fieldset" error={meta.touched && Boolean(meta.error)} disabled={disabled}>
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup
        name={name}
        value={field.value}
        onChange={(e) => {
          helpers.setValue(e.target.value);
          onValueChange?.(e.target.value);
        }}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel key={option.id} value={option.id} control={<Radio size="small" />} label={option.name} />
        ))}
      </RadioGroup>
      {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export default RadioButton;
