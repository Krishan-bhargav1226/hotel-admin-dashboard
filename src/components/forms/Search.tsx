import { TextField } from "@mui/material";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SearchMaster = ({ value, onChange }: Props) => {
  return (
    <TextField
      label="Search"
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      margin="normal"
    />
  );
};
