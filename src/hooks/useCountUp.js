import { useEffect, useState } from 'react';

export function useCountUp(end, duration = 1200, startOn = true) {
  const [value, setValue] = useState(0);
  const numEnd = Number(end) || 0;

  useEffect(() => {
    if (!startOn) {
      setValue(numEnd);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const step = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(easeOut * numEnd * 100) / 100);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numEnd, duration, startOn]);

  return value;
}
