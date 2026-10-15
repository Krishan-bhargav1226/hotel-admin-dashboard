import type { ReactNode } from "react";
import { Button } from "../button";
import { cn } from "../../../lib/utils";

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
  startIcon?: ReactNode;
}

const UISubmitButton = ({
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
}: UIButtonProps) => {
  const mapped =
    variant === "outlined" ? "outline" : variant === "text" ? "ghost" : color === "danger" ? "destructive" : color === "secondary" ? "secondary" : "primary";

  const tone =
    variant === "contained" && color === "success"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : variant === "contained" && color === "warning"
        ? "bg-amber-500 text-slate-950 hover:bg-amber-600"
        : variant === "outlined" && color === "success"
          ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          : variant === "outlined" && color === "danger"
            ? "border-rose-300 text-rose-700 hover:bg-rose-50"
            : variant === "outlined" && color === "warning"
              ? "border-amber-300 text-amber-800 hover:bg-amber-50"
              : "";

  return (
    <Button
      type={type}
      variant={mapped}
      size={size === "large" ? "lg" : size === "medium" ? "md" : "sm"}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={cn(width, tone, className)}
    >
      {!loading ? startIcon : null}
      {text}
    </Button>
  );
};

export default UISubmitButton;
