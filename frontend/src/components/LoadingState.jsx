import { useEffect, useState } from "react";

/**
 * LoadingState component containing staged loading checklist and animated skeletons.
 */
export function LoadingState() {
  const [stage, setStage] = useState(0);

  // Transition through loading stages over time
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1000);   // Job Specifications Loaded
    const timer2 = setTimeout(() => setStage(2), 2500);  // AI Comparing Skills
    const timer3 = setTimeout(() => setStage(3), 5000);  // Generating Suggestions

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="space-y-8 py-4">
      
      {/* Staged Loading Checklist UI */}
      <div className="max-w-md mx-auto bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-inner">
        <div className="text-center pb-2">
          <p className="text-slate-200 font-extrabold text-base tracking-wide flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-indigo-400 shrink-0" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI is analyzing your resume...
          </p>
        </div>

        <div className="space-y-4.5 border-t border-slate-850 pt-4">
          {/* Stage 0: Resume Loaded */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-200">
              Resume Loaded
            </span>
          </div>

          {/* Stage 1: Job Specifications Loaded */}
          <div className="flex items-center gap-3">
            {stage >= 1 ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-300">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></div>
              </div>
            )}
            <span className={`text-sm font-bold transition-all duration-300 ${stage >= 1 ? "text-slate-200" : "text-slate-500"}`}>
              Job Specifications Loaded
            </span>
          </div>

          {/* Stage 2: AI Comparing Skills */}
          <div className="flex items-center gap-3">
            {stage >= 2 ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-300">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : stage === 1 ? (
              <div className="w-6 h-6 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0 animate-pulse bg-indigo-500/5">
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              </div>
            )}
            <span className={`text-sm font-bold transition-all duration-300 ${
              stage >= 2 ? "text-slate-200" : stage === 1 ? "text-indigo-455 font-black animate-pulse" : "text-slate-500"
            }`}>
              AI Comparing Skills...
            </span>
          </div>

          {/* Stage 3: Generating Suggestions */}
          <div className="flex items-center gap-3">
            {stage >= 3 ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-300">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : stage === 2 ? (
              <div className="w-6 h-6 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0 animate-pulse bg-indigo-500/5">
                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              </div>
            )}
            <span className={`text-sm font-bold transition-all duration-300 ${
              stage >= 3 ? "text-slate-200" : stage === 2 ? "text-indigo-455 font-black animate-pulse" : "text-slate-500"
            }`}>
              Generating Suggestions...
            </span>
          </div>
        </div>
      </div>

      {/* Skeletons represent Dashboard Cards */}
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        {/* Top Score section skeleton */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-slate-800 shrink-0"></div>
          <div className="flex-1 space-y-3 w-full">
            <div className="h-5 bg-slate-800 rounded-lg w-1/3"></div>
            <div className="h-4 bg-slate-800 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded-lg w-1/2"></div>
          </div>
        </div>

        {/* Badge skills section skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="h-5 bg-slate-800 rounded-lg w-1/2"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-7 bg-slate-800 rounded-xl w-16"></div>
              <div className="h-7 bg-slate-800 rounded-xl w-24"></div>
              <div className="h-7 bg-slate-800 rounded-xl w-20"></div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="h-5 bg-slate-800 rounded-lg w-1/2"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-7 bg-slate-800 rounded-xl w-20"></div>
              <div className="h-7 bg-slate-800 rounded-xl w-16"></div>
              <div className="h-7 bg-slate-800 rounded-xl w-28"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
