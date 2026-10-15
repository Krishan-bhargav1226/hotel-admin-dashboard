import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

/** Short fade-up used for cards and page sections. Skipped when reduced motion is requested. */
export function FadeIn({ delay = 0, children, transition, ...props }: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition ?? { duration: reduce ? 0 : 0.22, delay: reduce ? 0 : delay, ease }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
