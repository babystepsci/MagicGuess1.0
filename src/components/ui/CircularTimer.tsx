import React, { useEffect, useState } from 'react';

interface CircularTimerProps {
  timeLeft: number;
  maxTime: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularTimer({ timeLeft, maxTime, size = 120, strokeWidth = 8 }: CircularTimerProps) {
  const [progress, setProgress] = useState(100);
  const [isUrgent, setIsUrgent] = useState(false);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    const percentage = Math.max(0, (timeLeft / maxTime) * 100);
    setProgress(percentage);
    const nowUrgent = timeLeft <= 2;
    setIsUrgent(nowUrgent);
  }, [timeLeft, maxTime]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getTimerColor = () => {
    if (timeLeft <= 1) return '#DC2626'; // Rouge intense
    if (timeLeft <= 2) return '#EA580C'; // Orange intense  
    if (timeLeft <= 3) return '#D97706'; // Jaune-orange
    return '#FFFFFF'; // White
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getTimerColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`transition-all duration-1000 ${isUrgent ? 'animate-pulse' : ''}`}
          style={{
            filter: isUrgent ? `drop-shadow(0 0 15px ${getTimerColor()}) drop-shadow(0 0 25px ${getTimerColor()})` : `drop-shadow(0 0 8px ${getTimerColor()})`,
          }}
        />
      </svg>
      
      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className={`text-3xl font-bold font-mono transition-all duration-100 ${
            isUrgent ? 'animate-pulse scale-110' : ''
          }`}
          style={{ 
            color: getTimerColor(),
            textShadow: `2px 2px 6px rgba(0,0,0,0.9), 0 0 15px ${getTimerColor()}40, 1px 1px 3px rgba(0,0,0,0.8), 0 0 20px ${getTimerColor()}60`
          }}
        >
          {timeLeft.toFixed(2)}
        </span>
      </div>
    </div>
  );
}