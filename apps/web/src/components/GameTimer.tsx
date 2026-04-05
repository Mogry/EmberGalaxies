import { useState, useEffect, useRef } from 'react';

interface GameTimerProps {
  finishAt: Date | string | null;
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

export function GameTimer({ finishAt, onComplete, className = '', compact = false }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    hasCompletedRef.current = false;
    if (!finishAt) {
      setTimeLeft(0);
      return;
    }

    const finishTime = new Date(finishAt).getTime();

    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, finishTime - now);
      setTimeLeft(remaining);

      // Only call onComplete once when timer reaches 0
      if (remaining === 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [finishAt]);

  if (!finishAt || timeLeft === 0) {
    return (
      <span className={`text-green-400 ${className}`}>
        Fertig!
      </span>
    );
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (compact) {
    if (hours > 0) {
      return (
        <span className={`text-yellow-400 font-mono ${className}`}>
          {hours}h {pad(minutes)}m
        </span>
      );
    }
    return (
      <span className={`text-yellow-400 font-mono ${className}`}>
        {pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  return (
    <span className={`text-yellow-400 font-mono ${className}`} data-finish-at={finishAt}>
      {hours > 0 && `${hours}h `}
      {minutes > 0 && `${minutes}m `}
      {seconds}s
    </span>
  );
}
