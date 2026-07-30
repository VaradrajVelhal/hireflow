import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import useMatchAnalysis from "../hooks/useMatchAnalysis";

// Import custom dashboard components
import MatchScore from "../components/MatchScore";
import SkillsSection from "../components/SkillsSection";
import StrengthsSection from "../components/StrengthsSection";
import WeaknessSection from "../components/WeaknessSection";
import InterviewTopics from "../components/InterviewTopics";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ResumeImprovements from "../components/ResumeImprovements";

function Jobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [applyingIds, setApplyingIds] = useState(new Set());

  // Modal and AI matching state hooks
  const [selectedJob, setSelectedJob] = useState(null);
  const { status, result, error: matchError, runAnalysis, reset: resetMatch } = useMatchAnalysis();
  
  // Custom fetch errors and redirection state
  const [fetchError, setFetchError] = useState(null);
  const [pendingRedirectJob, setPendingRedirectJob] = useState(null);
  const [pendingTrackJob, setPendingTrackJob] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const handleContinueRedirect = () => {
    if (redirecting || !pendingRedirectJob) return;
    setRedirecting(true);
    window.open(pendingRedirectJob.apply_link, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      setPendingRedirectJob(null);
      setRedirecting(false);
    }, 400);
  };

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedLocation(location);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search, location]);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({
      page,
      keyword: debouncedSearch,
      location: debouncedLocation,
    });

    API.get(`jobs/?${params.toString()}`)
      .then((res) => {
        setJobs(res.data.results);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
      })
      .catch((err) => {
        console.error(err);
        setFetchError("Failed to load jobs directory. Please check your network connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, debouncedLocation]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const applyJob = async (jobId) => {
    if (applyingIds.has(jobId)) return;

    setApplyingIds((prev) => new Set(prev).add(jobId));
    try {
      await API.post("apply/", {
        job: jobId,
        status: "applied",
        applied_via: "Website",
      });
      
      // Update local state to reflect the application
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, is_applied: true } : job
      ));
      
      showToast("Applied successfully!", "success");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Error applying";
      showToast(errorMsg, "error");
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleAnalyzeMatch = (job) => {
    if (status === "loading") return; // Prevent duplicate requests
    setSelectedJob(job);
    runAnalysis(job.id);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    resetMatch();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header & Search */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Explore Jobs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Find your next career move from our curated listings
            </p>
          </div>
          <div className="text-sm font-semibold bg-indigo-50/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full">
            {jobs.length} jobs available
          </div>
        </div>

        {/* Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or keyword..."
              className="input-field pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Location..."
              className="input-field pl-12"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {fetchError ? (
        <div className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl mx-auto my-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="w-20 h-20 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500/90 relative z-10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white relative z-10">Job Directory Offline</h3>
          <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto leading-relaxed relative z-10 font-semibold">
            {fetchError}
          </p>
          <button 
            onClick={fetchJobs}
            className="btn btn-primary mt-8 px-10 py-3 relative z-10 cursor-pointer active:scale-95 font-extrabold text-sm"
          >
            Retry Fetching Jobs
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse border border-slate-800 bg-slate-900/40">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex gap-6 items-start flex-1 w-full">
                  <div className="w-16 h-16 bg-slate-850 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-3 w-full">
                    <div className="h-6 bg-slate-850 rounded-lg w-1/3"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-slate-850 rounded-md w-24"></div>
                      <div className="h-4 bg-slate-850 rounded-md w-20"></div>
                      <div className="h-4 bg-slate-850 rounded-md w-16"></div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-4 bg-slate-850/60 rounded-md w-full"></div>
                      <div className="h-4 bg-slate-850/60 rounded-md w-5/6"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 mt-2 lg:mt-0">
                  <div className="h-10 bg-slate-850 rounded-xl w-32"></div>
                  <div className="h-10 bg-slate-850 rounded-xl w-36"></div>
                  <div className="h-10 bg-slate-850 rounded-xl w-10"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="w-20 h-20 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-500 relative z-10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="max-w-md mx-auto space-y-2 relative z-10">
                  <h3 className="text-xl font-extrabold text-white">No Jobs Found</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                    We couldn't find any job opportunities matching "{search || location}". Try adjusting or clearing your filters.
                  </p>
                </div>
                
                {(search || location) && (
                  <button 
                    onClick={() => { setSearch(""); setLocation(""); }}
                    className="btn btn-secondary mt-8 relative z-10 cursor-pointer active:scale-95"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="card group p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex gap-6 items-start flex-1">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-500 border border-indigo-100 dark:border-indigo-800/50 mt-1">
                        <span className="text-2xl font-black uppercase">{job.company[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-2">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{job.company}</span>
                          <span className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-black bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            Actively Hiring
                          </span>
                        </div>
                        
                        {/* Short Description (Truncated using line-clamp) */}
                        {job.description && (
                          <p className="text-slate-650 dark:text-slate-400 text-sm mt-3 leading-relaxed line-clamp-2 max-w-4xl font-medium">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0 lg:mt-1">
                      {/* Analyze Match Button with AI sparkles */}
                      <button
                        onClick={() => handleAnalyzeMatch(job)}
                        disabled={status === "loading"}
                        className={`btn btn-secondary text-sm flex items-center gap-2 cursor-pointer bg-gradient-to-r hover:from-indigo-600/10 hover:to-violet-600/10 hover:border-indigo-500/30 text-indigo-400 font-extrabold hover:text-indigo-300 transition-all active:scale-95 ${
                          status === "loading" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                        }`}
                      >
                        <svg className="w-4 h-4 text-indigo-455 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.071 4.929l-.396 2.476L16.2 7.8l2.476.396.396 2.476.396-2.476 2.476-.396-2.476-.396-.396-2.476z" />
                        </svg>
                        Analyze Match
                      </button>

                      {/* Track Application Button */}
                      <button
                        onClick={() => setPendingTrackJob(job)}
                        disabled={job.is_applied || applyingIds.has(job.id)}
                        className={`btn text-sm px-8 min-w-[155px] cursor-pointer transition-all duration-300 ${
                          job.is_applied 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:scale-100 hover:translate-y-0 cursor-default shadow-none" 
                            : applyingIds.has(job.id)
                            ? "bg-slate-800 border-slate-700/50 text-slate-500 scale-100 hover:scale-100 hover:translate-y-0 cursor-not-allowed shadow-none"
                            : "btn-primary active:scale-95"
                        }`}
                      >
                        {applyingIds.has(job.id) ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-slate-500 shrink-0" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Tracking...
                          </span>
                        ) : job.is_applied ? (
                          "Tracked"
                        ) : (
                          "Track Application"
                        )}
                      </button>

                      {/* Link to External Site */}
                      <button
                        onClick={() => setPendingRedirectJob(job)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition-all hover:bg-slate-200 dark:hover:bg-slate-750 cursor-pointer active:scale-90"
                        title="View Original Listing"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {(nextPage || prevPage) && (
            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={!prevPage}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center px-6 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm font-bold text-slate-900 dark:text-white font-mono">
                  Page <span className="text-indigo-600 mx-2">{page}</span>
                </div>

                <button
                  onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={!nextPage}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Resume Match Modal Overlay */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-opacity">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 cursor-default" onClick={handleCloseModal}></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden transform transition-all my-8 animate-in fade-in zoom-in-95 duration-350 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-950/20 shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.071 4.929l-.396 2.476L16.2 7.8l2.476.396.396 2.476.396-2.476 2.476-.396-2.476-.396-.396-2.476z" />
                  </svg>
                  AI Resume Match Analysis
                </h3>
                <p className="text-slate-400 text-xs mt-1 font-semibold">
                  Matching against <span className="text-indigo-400 font-bold">{selectedJob.title}</span> at <span className="text-slate-350">{selectedJob.company}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 scrollbar-thin">
              {status === "loading" && (
                <LoadingState message="Analyzing your resume against requirements..." />
              )}

              {status === "error" && (
                <ErrorState
                  message={matchError}
                  onRetry={() => runAnalysis(selectedJob.id)}
                />
              )}

              {status === "success" && result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Top Score summary component */}
                  <MatchScore score={result.match_score} reason={result.score_reason} />

                  {/* Skills badges component */}
                  <SkillsSection
                    matchingSkills={result.matching_skills}
                    missingSkills={result.missing_skills}
                  />

                  {/* Strengths component */}
                  <StrengthsSection strengths={result.strengths} />

                  {/* Weakness component */}
                  <WeaknessSection weaknesses={result.weaknesses} />

                  {/* Resume improvements checklist */}
                  <ResumeImprovements improvements={result.resume_improvements} />

                  {/* Interview Topics accordion */}
                  <InterviewTopics interviewTopics={result.interview_topics} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-slate-500 font-semibold">
                Match analysis powered by Gemini 3.5 Flash.
              </span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary w-full sm:w-auto text-xs py-2 px-6 cursor-pointer"
                >
                  Close Analysis
                </button>
                {status === "success" && (
                  <button
                    onClick={() => {
                      setPendingTrackJob(selectedJob);
                      handleCloseModal();
                    }}
                    disabled={selectedJob.is_applied || applyingIds.has(selectedJob.id)}
                    className={`btn text-xs py-2 px-6 w-full sm:w-auto cursor-pointer ${
                      selectedJob.is_applied
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:scale-100 hover:translate-y-0 cursor-default"
                        : "btn-primary"
                    }`}
                  >
                    {selectedJob.is_applied ? "Tracked" : "Track Application"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Confirmation Modal Overlay */}
      {pendingRedirectJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => !redirecting && setPendingRedirectJob(null)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-5">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-white">Redirecting to External Site</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                <h4 className="font-bold text-indigo-400 text-sm">{pendingRedirectJob.title}</h4>
                <p className="text-slate-400 text-xs font-semibold mt-1">{pendingRedirectJob.company}</p>
              </div>
              
              <p className="text-slate-355 text-xs font-semibold leading-relaxed">
                You are about to leave HireFlow and continue your application on the employer's website.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4 mt-2">
              <button
                onClick={() => !redirecting && setPendingRedirectJob(null)}
                disabled={redirecting}
                className="btn btn-secondary py-2 px-5 text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueRedirect}
                disabled={redirecting}
                className="btn btn-primary py-2 px-6 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {redirecting ? "Redirecting..." : "Continue"}
                {!redirecting && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Application Confirmation Modal Overlay */}
      {pendingTrackJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => !applyingIds.has(pendingTrackJob.id) && setPendingTrackJob(null)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-5">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-white">Track This Application?</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-slate-355 text-xs font-semibold leading-relaxed">
                This will add the job to your tracked applications in HireFlow and open the employer's application page in a new browser tab.
              </p>

              {/* Job Metadata details card */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                <h4 className="font-bold text-indigo-400 text-sm">{pendingTrackJob.title}</h4>
                <p className="text-slate-400 text-xs font-semibold mt-1">{pendingTrackJob.company}</p>
                <div className="flex items-center text-slate-550 text-[10px] font-bold mt-2">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {pendingTrackJob.location}
                </div>
              </div>
              
              {/* Information Note */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3 flex gap-2.5 items-start">
                <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.985l-.04.02v3.993l.04-.02a.75.75 0 111.083.986l-.04.02H10.5M12 7.51l-.008-.013a.141.141 0 01.21-.2.008.008 0 00.008.013zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                  Your application progress will be tracked in HireFlow, but you must complete the application on the employer's website.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4 mt-2">
              <button
                onClick={() => !applyingIds.has(pendingTrackJob.id) && setPendingTrackJob(null)}
                disabled={applyingIds.has(pendingTrackJob.id)}
                className="btn btn-secondary py-2 px-5 text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const jobId = pendingTrackJob.id;
                  const applyLink = pendingTrackJob.apply_link;
                  await applyJob(jobId);
                  window.open(applyLink, "_blank", "noopener,noreferrer");
                  setPendingTrackJob(null);
                }}
                disabled={applyingIds.has(pendingTrackJob.id)}
                className="btn btn-primary py-2 px-6 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {applyingIds.has(pendingTrackJob.id) ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-900 shrink-0" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tracking...
                  </>
                ) : (
                  <>
                    Track & Continue
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
