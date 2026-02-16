const variants = {
  success: 'bg-emerald/20 text-emerald border-emerald/40',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  danger: 'bg-danger/20 text-red-400 border-danger/40',
  info: 'bg-electric/20 text-electric border-electric/40',
  default: 'bg-white/10 text-elite-text-muted border-elite-border',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
