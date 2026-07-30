import { useRef, useState } from "react";
import useResumeUpload from "../hooks/useResumeUpload";

/**
 * Reusable ResumeUpload component providing drag-and-drop uploading of PDF resumes.
 * @param {Object} props
 * @param {Function} [props.onUploadSuccess] - Callback when resume is successfully uploaded
 */
export function ResumeUpload({ onUploadSuccess }) {
  const {
    file,
    uploading,
    progress,
    error,
    handleFileSelect,
    uploadCurrentFile,
    clearFile,
  } = useResumeUpload();

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleUploadSubmit = () => {
    uploadCurrentFile(onUploadSuccess);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-slate-700/50">
        
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Analyze compatibility, spot gaps, and prepare for interviews based on your profile.
          </p>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!file && !uploading ? onButtonClick : undefined}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative cursor-pointer group flex flex-col items-center justify-center min-h-[220px] ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
                : "border-slate-800 hover:border-slate-700 hover:bg-slate-950/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              disabled={uploading}
              onChange={handleChange}
            />

            {!file ? (
              // Empty State
              <div className="flex flex-col items-center select-none pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-900/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-200">
                  Drag and drop your PDF resume here
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Or click to browse from files (PDF only, max 5MB)
                </p>
              </div>
            ) : (
              // File selected state
              <div className="w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/50 border border-emerald-900/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-emerald-400 max-w-md truncate px-4" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {formatBytes(file.size)}
                </p>

                {/* Progress bar if uploading */}
                {uploading && (
                  <div className="w-full max-w-md mt-6">
                    <div className="flex justify-between items-center mb-1 text-xs text-slate-400 font-bold">
                      <span>Uploading Resume</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Clear button */}
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="mt-4 text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    Select a different file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Action button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleUploadSubmit}
              disabled={!file || uploading}
              className={`btn btn-primary w-full sm:w-auto sm:px-12 py-3.5 text-base flex items-center justify-center gap-2.5 ${
                !file || uploading
                  ? "bg-slate-800 border-slate-700/50 text-slate-500 scale-100 hover:scale-100 hover:translate-y-0 cursor-not-allowed shadow-none"
                  : ""
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
