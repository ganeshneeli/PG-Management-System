import { useState, useEffect } from 'react';

type TimeShift = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export function useTimeTheme() {
  const [timeShift, setTimeShift] = useState<TimeShift>('morning');

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 8) setTimeShift('dawn');
      else if (hour >= 8 && hour < 12) setTimeShift('morning');
      else if (hour >= 12 && hour < 17) setTimeShift('afternoon');
      else if (hour >= 17 && hour < 21) setTimeShift('evening');
      else setTimeShift('night');
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return timeShift;
}
