import { useEffect } from "react";
import JobDescription from "./JobDescription";

/**
 * Modal displaying full formatted job details, sanitized description,
 * and quick actions for matching, tracking, or viewing the external listing.
 */
function JobDetailsModal({
  job,
  onClose,
  onAnalyzeMatch,
  onTrackApplication,
  onOpenExternal,
  isAnalyzing = false,
  isApplying = false,
}) {
  useEffect(() => {
    if (!job) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-details-title"
    >
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden transform transition-all my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-800/80 bg-slate-950/20 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-800/50">
              <span className="text-xl font-black uppercase">
                {job.company?.[0] || "J"}
              </span>
            </div>
            <div className="min-w-0">
              <h3
                id="job-details-title"
                className="text-xl font-extrabold text-white leading-snug"
              >
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <span className="text-slate-300 font-semibold text-sm">
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center text-slate-400 text-xs font-medium">
                    <svg
                      className="w-3.5 h-3.5 mr-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {job.location}
                  </span>
                )}
                <span className="flex items-center text-emerald-400 text-[11px] font-black bg-emerald-900/20 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Actively Hiring
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close job details"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Description Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin">
          {job.description ? (
            <JobDescription description={job.description} variant="full" />
          ) : (
            <p className="text-slate-400 text-sm italic">
              No job description provided for this listing.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-5 cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onAnalyzeMatch(job);
              }}
              disabled={isAnalyzing}
              className="btn btn-secondary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer text-indigo-400 font-extrabold hover:border-indigo-500/30 hover:text-indigo-300"
            >
              Analyze Match
            </button>

            <button
              onClick={() => {
                onClose();
                onTrackApplication(job);
              }}
              disabled={job.is_applied || isApplying}
              className={`btn text-xs py-2 px-6 cursor-pointer ${
                job.is_applied
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:scale-100 hover:translate-y-0 cursor-default shadow-none"
                  : "btn-primary"
              }`}
            >
              {job.is_applied ? "Tracked" : "Track Application"}
            </button>

            {job.apply_link && (
              <button
                onClick={() => {
                  onClose();
                  onOpenExternal(job);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-indigo-400 transition-all hover:bg-slate-750 cursor-pointer"
                title="View Original Listing"
                aria-label="View original listing"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailsModal;
