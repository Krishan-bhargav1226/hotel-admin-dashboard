import { Box } from "@mui/material";

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SectionBox({ children, className = "", onClick }: Props) {
  return (
    <Box
      className={className}
      onClick={onClick}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.02), 0 6px 16px -2px rgba(15, 23, 42, 0.03)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": onClick
          ? {
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
              borderColor: "#CBD5E1",
            }
          : undefined,
      }}
    >
      {children}
    </Box>
  );
}
