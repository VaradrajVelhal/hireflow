/**
 * Component to display matching and missing skills as modern styled badges.
 * @param {Object} props
 * @param {string[]} props.matchingSkills - List of skills found in resume that match job
 * @param {string[]} props.missingSkills - List of key job requirements missing from resume
 */
export function SkillsSection({ matchingSkills = [], missingSkills = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Matching Skills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-750 transition-colors shadow-lg">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Matching Skills ({matchingSkills.length})
        </h4>
        {matchingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {matchingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black tracking-wide shadow-md transition-all duration-300 hover:bg-emerald-400 hover:scale-105 active:scale-95"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-xs font-semibold">
            No direct skill matches identified.
          </p>
        )}
      </div>

      {/* Missing Skills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-750 transition-colors shadow-lg">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          Missing Skills ({missingSkills.length})
        </h4>
        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.25 bg-transparent border-2 border-red-500/40 text-red-500 dark:text-red-400 rounded-xl text-xs font-black tracking-wide transition-all duration-300 hover:bg-red-500/5 hover:border-red-500/70 hover:scale-105 active:scale-95"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-xs font-semibold">
            Your resume covers all required skills for this job.
          </p>
        )}
      </div>

    </div>
  );
}

export default SkillsSection;
