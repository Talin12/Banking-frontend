import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function OtpInput({ value, onChange, length = 6, disabled }) {
  const refs = useRef([]);

  useEffect(() => {
    const i = value.length;
    if (i < length && refs.current[i]) refs.current[i].focus();
  }, [value.length, length]);

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;
    const arr = value.split('');
    arr[index] = digit.slice(-1);
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const arr = value.split('');
      arr.pop();
      onChange(arr.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    if (pasted.length === length) refs.current[length - 1]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-heading bg-elite-surface border-2 border-elite-border rounded-xl text-white
            focus:border-gold focus:ring-2 focus:ring-gold/30 focus:outline-none transition-all duration-200"
          whileFocus={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}
