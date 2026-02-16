import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, glow = false, ...props }) {
  const base =
    'rounded-2xl border border-elite-border overflow-hidden ' +
    'bg-gradient-to-br from-elite-card to-elite-surface';
  const hoverClass = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-gold/20'
    : '';
  const glowClass = glow ? 'hover:shadow-glow-gold' : '';

  return (
    <motion.div
      className={`${base} ${hoverClass} ${glowClass} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-6 border-b border-elite-border ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
