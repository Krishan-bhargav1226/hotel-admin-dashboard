import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { IconButton as MuiIconButton } from "@mui/material";
import {
  IconButtonBgColors,
  IconButtonIconColors,
  type IconButtonBgColorKeys,
  type IconButtonIconColorKeys,
} from "./IconButtonColors";

interface IconButtonProps {
  tooltip?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
  bgColor?: IconButtonBgColorKeys;
  iconColor?: IconButtonIconColorKeys;
}
export const IconButton: React.FC<IconButtonProps> = ({
  tooltip,
  onClick,
  disabled = false,
  icon,
  size = "medium",
  className = "",
  tooltipPlacement = "top",
  bgColor = "RED",
  iconColor = "WHITE",
}) => {
  const backgroundColor = IconButtonBgColors[bgColor];
  const color = iconColor === "WHITE" ? backgroundColor : IconButtonIconColors[iconColor];

  const button = (
    <MuiIconButton
      onClick={onClick}
      disabled={disabled}
      size={size}
      aria-label={tooltip}
      className={`inline-flex !h-9 !w-9 items-center justify-center !rounded-lg border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${className}`}
      style={{
        minWidth: "auto",
        padding: 0,
        backgroundColor: `${backgroundColor}14`,
        color,
        borderColor: `${backgroundColor}33`,
      }}
    >
      {icon}
    </MuiIconButton>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement={tooltipPlacement}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

