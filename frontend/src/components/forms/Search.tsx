import { Search } from "lucide-react";
import { Input } from "../ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SearchMaster = ({ value, onChange }: Props) => {
  return (
    <Input
      label="Search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search records"
      icon={Search}
    />
  );
};
