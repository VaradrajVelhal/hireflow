import ScoreCircle from "./ScoreCircle";

/**
 * Top section displaying the ScoreCircle and a detailed explanation of the match score.
 * @param {Object} props
 * @param {number} props.score - The job match score (0-100)
 * @param {string} props.reason - Summary explanation of the compatibility result
 */
export function MatchScore({ score = 0, reason = "" }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
      {/* Circle Meter */}
      <div className="shrink-0">
        <ScoreCircle score={score} size={200} strokeWidth={12} />
      </div>

      {/* Description text under score */}
      <div className="space-y-3.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
          <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Match Explanation
        </div>
        <h3 className="text-xl font-extrabold text-white">
          Why this compatibility rating?
        </h3>
        <p className="text-slate-355 text-sm leading-relaxed font-semibold">
          {reason || "The AI model has analyzed your resume text against the requirements of the job description. The key match and gap elements are detailed below."}
        </p>
      </div>
    </div>
  );
}

export default MatchScore;
