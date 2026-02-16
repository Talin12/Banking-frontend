import { forwardRef } from 'react';

const base =
  'w-full px-4 py-3 rounded-xl bg-elite-surface border border-elite-border text-white placeholder-elite-text-muted ' +
  'transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none';

export const Input = forwardRef(function Input(
  { label, error, className = '', type = 'text', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-elite-text-muted mb-1.5">{label}</label>
      )}
      <input
        ref={ref}
        type={type}
        className={`${base} ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
});

export function FloatingLabelInput({ label, ...props }) {
  return (
    <div className="relative">
      <input
        className={`${base} pt-5`}
        placeholder=" "
        {...props}
      />
      <label className="absolute left-4 top-1/2 -translate-y-1/2 text-elite-text-muted transition-all duration-200 pointer-events-none origin-left scale-100 peer-placeholder-shown:scale-100 peer-focus:scale-90 peer-focus:-translate-y-6 peer-focus:text-gold [&:not(:placeholder-shown)]:scale-90 [&:not(:placeholder-shown)]:-translate-y-6">
        {label}
      </label>
    </div>
  );
}
