/**
 * Component to display resume strengths as premium success cards.
 * @param {Object} props
 * @param {string[]} props.strengths - List of candidate strengths identified by AI
 */
export function StrengthsSection({ strengths = [] }) {
  if (strengths.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
        Strengths & Highlights
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths.map((strength, index) => (
          <div
            key={index}
            className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 shadow-md shadow-emerald-500/2"
          >
            {/* Emerald Checkmark Circle */}
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <p className="text-sm text-slate-200 leading-relaxed font-semibold">
              {strength}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StrengthsSection;
