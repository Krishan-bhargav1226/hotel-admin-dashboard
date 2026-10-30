import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface UiDialogProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  fullScreen?: boolean;
}

const UiDialog = ({
  open,
  title,
  children,
  onClose,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen = false,
}: UiDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} fullScreen={fullScreen}>
      {title ? (
        <DialogTitle>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-slate-800"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </DialogTitle>
      ) : null}
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
};

export default UiDialog;
