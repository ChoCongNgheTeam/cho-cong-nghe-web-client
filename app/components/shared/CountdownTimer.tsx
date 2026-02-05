// components/shared/CountdownTimer.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ hours, minutes, seconds }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours, minutes, seconds });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
      <span className="text-white text-sm font-medium">Bắt đầu sau:</span>
      <div className="flex gap-1">
        {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
          <React.Fragment key={i}>
            <span className="bg-white text-promotion font-bold px-2 py-1 rounded text-sm min-w-[32px] text-center">
              {String(val).padStart(2, '0')}
            </span>
            {i < 2 && <span className="text-white font-bold">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}