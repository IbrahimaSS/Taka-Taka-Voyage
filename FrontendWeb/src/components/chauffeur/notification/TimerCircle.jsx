import { useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';

/**
 * TimerCircle stable : total fixé au début, remaining varie
 */
const TimerCircle = ({
  total = 60,
  remaining = 60,
  size = 40,
  strokeWidth = 4,
  onTimeEnd,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = Math.max(1, Number(total || 60));
  const safeRemaining = Math.max(0, Number(remaining ?? safeTotal));
  const progress = Math.min(1, Math.max(0, 1 - safeRemaining / safeTotal));
  const strokeDashoffset = circumference * (1 - progress);

  // évite d'appeler onTimeEnd plusieurs fois
  const endedRef = useRef(false);
  useEffect(() => {
    if (safeRemaining <= 0 && !endedRef.current) {
      endedRef.current = true;
      onTimeEnd?.();
    }
  }, [safeRemaining, onTimeEnd]);

  // reset si total change (nouvelle demande)
  useEffect(() => {
    endedRef.current = false;
  }, [safeTotal]);

  const getColor = () => {
    if (progress < 0.5) return "#10B981";
    if (progress < 0.75) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.2s linear, stroke 0.3s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <Timer className="w-4 h-4 text-white" />
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold text-white/90">
        {safeRemaining}s
      </div>
    </div>
  );
};

export default TimerCircle;
