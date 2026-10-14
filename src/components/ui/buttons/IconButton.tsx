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
  const color = IconButtonIconColors[iconColor];

  const button = (
    <MuiIconButton
      onClick={onClick}
      disabled={disabled}
      size={size}
      className={`p-2 rounded-full shadow-md hover:scale-105 transition-transform duration-150 ${className}`}
      style={{
        minWidth: "auto",
        padding: 8,
        backgroundColor,
        color,
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

