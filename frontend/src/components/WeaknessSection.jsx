/**
 * Component to display resume weaknesses or gaps as warning cards.
 * @param {Object} props
 * @param {string[]} props.weaknesses - List of candidate weaknesses identified by AI
 */
export function WeaknessSection({ weaknesses = [] }) {
  if (weaknesses.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
        Weaknesses & Areas to Address
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weaknesses.map((weakness, index) => (
          <div
            key={index}
            className="flex items-start gap-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 shadow-md shadow-orange-500/2"
          >
            {/* Orange Alert Circle */}
            <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5 animate-pulse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <p className="text-sm text-slate-200 leading-relaxed font-semibold">
              {weakness}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeaknessSection;
