import { useState } from "react";

/**
 * Reusable checklist component for resume improvements.
 * @param {Object} props
 * @param {string[]} props.improvements - Array of suggested improvements
 */
export function ResumeImprovements({ improvements = [] }) {
  if (improvements.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
        Suggested Resume Improvements
      </h4>
      <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-3.5 shadow-inner">
        {improvements.map((improvement, index) => (
          <ImprovementItem key={index} text={improvement} />
        ))}
      </div>
    </div>
  );
}

function ImprovementItem({ text }) {
  const [completed, setCompleted] = useState(false);

  return (
    <label className="flex items-start gap-3.5 cursor-pointer group select-none py-1">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => setCompleted(!completed)}
        className="mt-1 w-4.5 h-4.5 bg-slate-950 border border-slate-800 rounded text-indigo-650 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer accent-indigo-600 shrink-0"
      />
      <span className={`text-sm leading-relaxed transition-all duration-300 ${
        completed 
          ? "text-slate-500 line-through decoration-slate-600 font-medium" 
          : "text-slate-200 font-semibold group-hover:text-indigo-400"
      }`}>
        {text}
      </span>
    </label>
  );
}

export default ResumeImprovements;
