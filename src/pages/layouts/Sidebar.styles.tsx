import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

export const SidebarRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen",
})<{ sidebarOpen: boolean }>(({ sidebarOpen }) => ({
  height: "100%",
  color: "#F8FAFC",
  display: "flex",
  flexDirection: "column",
  padding: sidebarOpen ? "18px 12px" : "18px 8px",
  backgroundColor: "#0B0F19",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  userSelect: "none",
}));

export const LogoContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen",
})<{ sidebarOpen: boolean }>(({ sidebarOpen }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  margin: sidebarOpen ? "6px 8px 24px 8px" : "6px 0 24px 0",
  justifyContent: sidebarOpen ? "flex-start" : "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
}));

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen" && prop !== "active",
})<{ sidebarOpen: boolean; active?: boolean }>(({ sidebarOpen, active }) => ({
  marginBottom: "4px",
  justifyContent: sidebarOpen ? "initial" : "center",
  padding: sidebarOpen ? "9px 12px" : "9px 0",
  borderRadius: "10px",
  color: active ? "#FFFFFF" : "#94A3B8",
  backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
  border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    "& .MuiListItemIcon-root": { color: "#FFFFFF" },
  },
  "&:active": {
    transform: "scale(0.98)",
  },
}));

export const StyledListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen" && prop !== "active",
})<{ sidebarOpen: boolean; active?: boolean }>(({ sidebarOpen, active }) => ({
  minWidth: 0,
  marginRight: sidebarOpen ? 14 : 0,
  justifyContent: "center",
  color: active ? "#F59E0B" : "#64748B",
  transition: "color 0.2s ease",
}));
