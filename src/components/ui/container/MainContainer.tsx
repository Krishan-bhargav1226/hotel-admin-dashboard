import React from "react";
import { Box } from "@mui/material";

const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        p: { xs: 1, md: 2 },
        maxWidth: 1500,
        mx: "auto",
        color: "text.primary",
      }}
    >
      {children}
    </Box>
  );
};

export default MainContainer;
