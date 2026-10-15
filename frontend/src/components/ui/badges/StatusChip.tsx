import { Box } from "@mui/material";

interface Props {
  label: string;
  color: string;
  className?: string;
}

/** Small pill with a colour dot — used for room / stay status. */
const StatusChip = ({ label, color, className = "" }: Props) => (
  <Box
    component="span"
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    sx={{ bgcolor: `${color}1A`, color }}
  >
    <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
    {label}
  </Box>
);

export default StatusChip;
