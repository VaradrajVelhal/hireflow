import { useEffect, useState } from "react";

/**
 * Reusable premium circular progress indicator representing a match score.
 * @param {Object} props
 * @param {number} props.score - The match score (0-100)
 * @param {number} [props.size] - Diameter size of the circle (default 200)
 * @param {number} [props.strokeWidth] - Width of the progress stroke (default 12)
 */
export function ScoreCircle({ score = 0, size = 200, strokeWidth = 12 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Animate the score filling on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  // Determine color coding based on rating rules
  const getColorClasses = (val) => {
    if (val >= 90) {
      // 90-100 Dark Green
      return {
        text: "text-emerald-600 dark:text-emerald-500",
        stroke: "stroke-emerald-600 dark:stroke-emerald-500",
        bg: "bg-emerald-500/5",
        border: "border-emerald-500/10",
        glow: "shadow-emerald-500/20",
        gradient: "from-emerald-500 to-green-600",
        label: "Excellent",
      };
    } else if (val >= 75) {
      // 75-89 Green
      return {
        text: "text-green-500",
        stroke: "stroke-green-500",
        bg: "bg-green-500/5",
        border: "border-green-500/10",
        glow: "shadow-green-500/20",
        gradient: "from-green-400 to-emerald-500",
        label: "Good Match",
      };
    } else if (val >= 60) {
      // 60-74 Blue
      return {
        text: "text-blue-500",
        stroke: "stroke-blue-500",
        bg: "bg-blue-500/5",
        border: "border-blue-500/10",
        glow: "shadow-blue-500/20",
        gradient: "from-blue-400 to-indigo-500",
        label: "Fair Match",
      };
    } else if (val >= 40) {
      // 40-59 Orange
      return {
        text: "text-orange-500",
        stroke: "stroke-orange-500",
        bg: "bg-orange-500/5",
        border: "border-orange-500/10",
        glow: "shadow-orange-500/20",
        gradient: "from-amber-400 to-orange-500",
        label: "Low Match",
      };
    } else {
      // 0-39 Red
      return {
        text: "text-red-500",
        stroke: "stroke-red-500",
        bg: "bg-red-500/5",
        border: "border-red-500/10",
        glow: "shadow-red-500/20",
        gradient: "from-red-400 to-rose-600",
        label: "Poor Match",
      };
    }
  };

  const colors = getColorClasses(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`relative flex items-center justify-center rounded-full transition-all duration-700 p-2 shadow-2xl ${colors.bg} ${colors.border} border`}
        style={{ width: size + 16, height: size + 16 }}
      >
        {/* Glow filter under circle */}
        <div 
          className={`absolute inset-4 rounded-full blur-xl opacity-45 -z-10 shadow-lg ${colors.glow}`}
          style={{ transition: "all 1s ease" }}
        />

        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl md:text-5xl font-black font-mono tracking-tighter ${colors.text}`}>
            {animatedScore}%
          </span>
          <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-450 mt-1">
            {colors.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ScoreCircle;
