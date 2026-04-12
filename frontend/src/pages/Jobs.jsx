import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, debouncedLocation]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const checkMatch = async (jobId) => {
    const skills = prompt("Enter your skills (comma separated)");
    if (!skills) return;

    try {
      const res = await API.post("match-score/", {
        job_id: jobId,
        skills: skills,
      });
      alert(`Match Score: ${res.data.match_score}%`);
    } catch (err) {
      console.error(err);
      alert("Error calculating match score");
    }
  };

  const applyJob = async (jobId) => {
    try {
      await API.post("apply/", {
        job: jobId,
        status: "applied",
        applied_via: "Website",
      });
      alert("Applied and tracking started!");
    } catch (err) {
      console.error(err);
      alert("Error applying");
    }
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
          <div className="text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {jobs.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                  We couldn't find any jobs matching your current search criteria. Try adjusting your filters.
                </p>
                {(search || location) && (
                  <button 
                    onClick={() => { setSearch(""); setLocation(""); }}
                    className="btn btn-secondary mt-8"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="card group p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-500 border border-indigo-100 dark:border-indigo-800/50">
                        <span className="text-2xl font-black uppercase">{job.company[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-2">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{job.company}</span>
                          <span className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                            Actively Hiring
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => checkMatch(job.id)}
                        className="btn btn-secondary text-sm"
                      >
                        Match Score
                      </button>
                      <button
                        onClick={() => applyJob(job.id)}
                        className="btn btn-primary text-sm px-8"
                      >
                        Quick Apply
                      </button>
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                        title="View Original Listing"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
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
                
                <div className="flex items-center px-6 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm font-bold text-slate-900 dark:text-white">
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
    </div>
  );
}

export default Jobs;
