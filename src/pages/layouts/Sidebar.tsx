import { List, ListItemText, Typography, Box } from "@mui/material";
import {
  LogoContainer,
  SidebarRoot,
  StyledListItemButton,
  StyledListItemIcon,
} from "./Sidebar.styles";
import { sidebarItems } from "./sidebarItems";
import { useLocation, useNavigate } from "react-router-dom";
import { Images } from "../../components/constants/Image";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";

interface SidebarProps {
  sidebarOpen?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ sidebarOpen = true, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: settings } = useGetSettingsQuery();

  const isActive = (link: string) =>
    link === "/" ? location.pathname === "/" : location.pathname.startsWith(link);

  return (
    <SidebarRoot sidebarOpen={sidebarOpen}>
      <LogoContainer sidebarOpen={sidebarOpen}>
        <img
          src={Images.logo}
          alt="logo"
          className="h-8 w-8 shrink-0 rounded-lg shadow-xs"
        />
        {sidebarOpen && (
          <Box className="min-w-0">
            <Typography
              variant="subtitle2"
              fontWeight={800}
              noWrap
              sx={{
                maxWidth: 185,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                fontSize: "0.92rem",
                lineHeight: 1.2,
              }}
            >
              {settings?.hotelName || "Grand Horizon"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#F59E0B",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Hospitality PMS
            </Typography>
          </Box>
        )}
      </LogoContainer>

      <List sx={{ pt: 0, px: 0 }}>
        {sidebarItems.map((item) => {
          const active = isActive(item.link);
          return (
            <StyledListItemButton
              key={item.label}
              sidebarOpen={sidebarOpen}
              active={active}
              onClick={() => {
                navigate(item.link);
                onNavigate?.();
              }}
            >
              <StyledListItemIcon sidebarOpen={sidebarOpen} active={active}>
                {item.icon}
              </StyledListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      letterSpacing: "-0.01em",
                    },
                  }}
                />
              )}
              {sidebarOpen && active && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-auto" />
              )}
            </StyledListItemButton>
          );
        })}
      </List>
    </SidebarRoot>
  );
}
