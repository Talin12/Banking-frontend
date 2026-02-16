import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gold text-black font-heading hover:shadow-glow-gold active:scale-[0.98] border border-gold/30',
  electric: 'bg-electric text-black font-heading hover:shadow-glow-electric active:scale-[0.98] border border-electric/50',
  success: 'bg-emerald text-white font-heading hover:shadow-glow-emerald active:scale-[0.98] border border-emerald/50',
  danger: 'bg-danger/90 text-white hover:bg-danger hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] border border-danger/30',
  ghost: 'bg-transparent text-elite-text-muted hover:text-gold hover:bg-white/5 border border-elite-border hover:border-gold/30',
  outline: 'bg-transparent text-gold border border-gold/50 hover:bg-gold/10 hover:shadow-glow-gold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

export const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', loading, leftIcon, rightIcon, ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  const cls = `${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`;

  return (
    <motion.button
      ref={ref}
      className={cls}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});
