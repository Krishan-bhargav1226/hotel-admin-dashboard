import { useState } from "react";
import { Box, CssBaseline, useTheme, useMediaQuery, Drawer } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const drawerWidthOpen = 260;
const drawerWidthClosed = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidthOpen } }}
        >
          <Sidebar sidebarOpen onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      ) : (
        <Box
          className="bg-sidebar-bg"
          sx={{
            width: sidebarOpen ? drawerWidthOpen : drawerWidthClosed,
            flexShrink: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
            height: "100vh",
          }}
        >
          <Sidebar sidebarOpen={sidebarOpen} />
        </Box>
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header onMenuClick={isMobile ? handleDrawerToggle : handleSidebarToggle} showMenuIcon />
        <Box component="main" className="bg-surface" sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
