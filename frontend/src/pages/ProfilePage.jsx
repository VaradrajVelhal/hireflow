import { useState } from "react";
import useProfile from "../hooks/useProfile";
import ResumeUpload from "../components/ResumeUpload";

/**
 * ProfilePage (Page 1 refactored) displaying user metadata and resume management actions.
 */
export function ProfilePage() {
  const { profileData, loading, deleting, refetch, deleteCurrentResume } = useProfile();
  const [showReplaceUpload, setShowReplaceUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse space-y-8">
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-3xl"></div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400">
        Could not load profile details. Please try reloading the page.
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch {
      return dateStr;
    }
  };

  // Helper to format date-time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch {
      return dateStr;
    }
  };

  // Get Initials for Avatar
  const getInitials = () => {
    const { first_name, last_name, username } = profileData;
    if (first_name || last_name) {
      return `${first_name?.[0] || ""}${last_name?.[0] || ""}`.toUpperCase();
    }
    return (username?.[0] || "U").toUpperCase();
  };

  // Get Full Name
  const getFullName = () => {
    const { first_name, last_name } = profileData;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return "User Profile";
  };

  const handleDeleteConfirm = async () => {
    const success = await deleteCurrentResume();
    if (success) {
      setShowDeleteConfirm(false);
      setShowReplaceUpload(false);
    }
  };

  const handleUploadSuccess = () => {
    refetch();
    setShowReplaceUpload(false);
  };

  const initials = getInitials();
  const fullName = getFullName();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* 1. User Information Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          
          {/* Avatar with Initials */}
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
            {initials}
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <h2 className="text-2xl font-black text-white leading-tight">
              {fullName}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                @{profileData.username}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden sm:inline"></span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profileData.email}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden sm:inline"></span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {formatDate(profileData.date_joined)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Resume Card Section */}
      {profileData.resume_name && !showReplaceUpload ? (
        // Resume Card
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h3 className="text-lg font-extrabold text-white">Resume Document</h3>
              <p className="text-slate-400 text-xs mt-1">Manage your active profile resume used for AI matching.</p>
            </div>

            {/* AI Ready Indicator & Status Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Active Resume
              </span>
              {profileData.is_ai_ready ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  AI Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Pending AI Parser
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-450">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-200 truncate pr-4" title={profileData.resume_name}>
                {profileData.resume_name}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Uploaded on {formatDateTime(profileData.uploaded_at)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowReplaceUpload(true)}
              className="btn btn-secondary text-xs px-6 py-2 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
              </svg>
              Replace Resume
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn text-xs px-6 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/20 hover:scale-[1.02] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Resume
            </button>
          </div>
        </div>
      ) : showReplaceUpload ? (
        // Inline Replace Upload Card
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Resume Upload Workspace</span>
            <button
              onClick={() => setShowReplaceUpload(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Cancel Replace
            </button>
          </div>
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : (
        // Attractive Empty State
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          {/* Empty Illustration Icon */}
          <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-650 relative">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-600/10 border border-rose-500/40 text-rose-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2 relative z-10">
            <h3 className="text-xl font-extrabold text-white">No Resume Uploaded</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your resume in PDF format. Without a resume, our real-time AI Match rating, skill gap analysis, and interview topics helper are unavailable.
            </p>
          </div>

          {/* Inline Upload Form */}
          <div className="pt-4 max-w-lg mx-auto">
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click to cancel */}
          <div className="absolute inset-0 cursor-default" onClick={() => setShowDeleteConfirm(false)}></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[28px] p-6 shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 space-y-6">
            
            {/* Warning Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Delete Resume?</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  This action is permanent. Purging your resume deletes the PDF and clears all parsed text. AI Match features across all jobs will be locked.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary text-xs px-5 py-2 cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn text-xs px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Resume"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ProfilePage;
