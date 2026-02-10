import { useState, useEffect, useRef } from 'react';

/**
 * 숫자를 0부터 목표값까지 카운트업하는 훅
 * @param end - 목표 숫자
 * @param duration - 애니메이션 지속 시간 (ms)
 */
export function useCountUp(end: number, duration: number = 600): number {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;

    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (end - startValue) * eased;

      setCount(Math.round(current * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}
