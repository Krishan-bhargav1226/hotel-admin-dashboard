import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  title: string;
  className?: string;
}

const FormTitle: React.FC<Props> = ({ title, className = "" }) => {
  return (
    <Box
      className={`sm:flex items-center justify-between ${className}`}
      sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}
    >
      <Typography variant="h6" color="text.primary" fontWeight={600}>
        {title}
      </Typography>
    </Box>
  );
};

export default FormTitle;
