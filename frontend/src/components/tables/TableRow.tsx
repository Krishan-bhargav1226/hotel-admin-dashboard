import { Children, cloneElement, isValidElement, useContext, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TableLabelContext } from "./tableContext";
import { cn } from "../../lib/utils";

interface Props {
  children: ReactNode;
  itemIndex: number;
}

export const TableRow = ({ children, itemIndex }: Props) => {
  const reduce = useReducedMotion();
  const labels = useContext(TableLabelContext);

  const cells = Children.map(children, (child, index) => {
    if (!isValidElement<Record<string, unknown>>(child) || child.type !== "td") return child;
    const colSpan = Number(child.props.colSpan ?? 1);
    const className = typeof child.props.className === "string" ? child.props.className : undefined;
    return cloneElement(child, {
      "data-label": colSpan > 1 ? "" : (labels[index] ?? ""),
      className,
    });
  });

  return (
    <motion.tr
      className={cn(
        itemIndex % 2 === 0 ? "bg-white dark:bg-[var(--card)]" : "bg-slate-50/70 dark:bg-white/[0.02]",
        "border-t border-slate-100 text-slate-900 transition-colors hover:bg-brand-50/60 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-brand-900/20"
      )}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.18, delay: Math.min(itemIndex, 8) * 0.02 }}
    >
      {cells}
    </motion.tr>
  );
};
