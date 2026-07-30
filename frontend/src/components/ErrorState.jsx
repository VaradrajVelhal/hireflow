/**
 * ErrorState component displaying a card for failed operations and a retry button.
 * @param {Object} props
 * @param {string} [props.title] - Heading for the error state
 * @param {string} [props.message] - Error description detail
 * @param {Function} props.onRetry - Callback triggered when retry button is clicked
 */
export function ErrorState({
  title = "Analysis Failed",
  message = "We were unable to calculate your match score. This typically happens when you haven't uploaded a resume, or the API is currently unavailable.",
  onRetry,
}) {
  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <div className="bg-slate-900 border border-rose-950/40 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-white mb-3">
          {title}
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-primary w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
              </svg>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
