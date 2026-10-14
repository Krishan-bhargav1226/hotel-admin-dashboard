import { motion } from "framer-motion";
import React from "react";

interface Props {
  children: React.ReactNode;
  itemIndex: number;
}

export const TableRow = ({ children, itemIndex }: Props) => {
  return (
    <motion.tr
      className={`${itemIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} text-gray-900`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(itemIndex, 8) * 0.02 }}
    >
      {children}
    </motion.tr>
  );
};
