import React from "react";
import { Box } from "@mui/material";
import FormTitle from "./FormTitle";

const BoxTitle = ({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) => {
  return (
    <Box
      className={className}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box className="flex items-center justify-between gap-2">
        <Box className="flex-1">
          <FormTitle title={title} />
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
};

export default BoxTitle;
