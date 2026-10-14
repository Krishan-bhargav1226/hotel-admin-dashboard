import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/** Page heading with an optional action area on the right. */
const PageTitle = ({ title, subtitle, actions }: Props) => {
  return (
    <Box className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <Box>
        <Typography variant="h5" fontWeight={700} className="text-primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className="text-gray-500">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box className="flex flex-wrap items-center gap-2">{actions}</Box>}
    </Box>
  );
};

export default PageTitle;
