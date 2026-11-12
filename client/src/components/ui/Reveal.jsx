import { motion, useReducedMotion } from "framer-motion";

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
  amount = 0.2,
  once = true,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
