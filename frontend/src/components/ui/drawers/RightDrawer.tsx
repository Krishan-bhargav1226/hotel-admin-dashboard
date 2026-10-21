import React from "react";
import Drawer from "@mui/material/Drawer";
import { Box, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  title?: string;
  children: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({
  open,
  onClose,
  width = 440,
  title,
  children,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width,
          maxWidth: "100vw",
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          {title && <Typography variant="h6" fontWeight={700}>{title}</Typography>}
          <IconButton onClick={onClose} aria-label="Close drawer">
            <X className="size-5" />
          </IconButton>
        </Box>
        <Box flex={1} overflow="auto" pt={1}>
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};

export default RightDrawer;
