import React from "react";
import { Button, Box, CircularProgress } from "@mui/material";

interface UIButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  width?: "w-full" | "w-auto";
  color?: "primary" | "secondary" | "success" | "danger" | "warning";
  startIcon?: React.ReactNode;
}

const UISubmitButton: React.FC<UIButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "submit",
  variant = "contained",
  size = "small",
  width = "w-auto",
  color = "primary",
  startIcon,
}) => {
  const filled = {
    primary: "!bg-slate-900 hover:!bg-slate-800 !text-white shadow-xs",
    secondary: "!bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold shadow-xs",
    success: "!bg-emerald-600 hover:!bg-emerald-700 !text-white shadow-xs",
    danger: "!bg-rose-600 hover:!bg-rose-700 !text-white shadow-xs",
    warning: "!bg-amber-400 hover:!bg-amber-500 !text-slate-950 shadow-xs",
  };
  const outlined = {
    primary: "!border-slate-300 !text-slate-800 hover:!bg-slate-50",
    secondary: "!border-amber-400 !text-amber-800 hover:!bg-amber-50",
    success: "!border-emerald-300 !text-emerald-700 hover:!bg-emerald-50",
    danger: "!border-rose-300 !text-rose-700 hover:!bg-rose-50",
    warning: "!border-amber-300 !text-amber-800 hover:!bg-amber-50",
  };

  return (
    <Box display="flex">
      <Button
        type={type}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : startIcon}
        className={`!px-3.5 !py-1.5 !rounded-lg !text-xs !font-semibold !tracking-tight transition-all duration-200 active:scale-[0.98] ${width} ${
          variant === "contained" ? filled[color] : outlined[color]
        } ${className}`}
        sx={{
          textTransform: "none",
        }}
      >
        {text}
      </Button>
    </Box>
  );
};

export default UISubmitButton;
