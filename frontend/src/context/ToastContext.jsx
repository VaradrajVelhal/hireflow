import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastIcon = ({ type }) => {
  switch (type) {
    case "success":
      return (
        <svg className="w-5 h-5 text-emerald-500 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "error":
      return (
        <svg className="w-5 h-5 text-rose-500 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "warning":
      return (
        <svg className="w-5 h-5 text-amber-500 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg className="w-5 h-5 text-indigo-500 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const getToastStyles = (type) => {
  switch (type) {
    case "success":
      return "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300";
    case "error":
      return "bg-rose-50 dark:bg-rose-950/90 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-300";
    case "warning":
      return "bg-amber-50 dark:bg-amber-950/90 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-300";
    case "info":
    default:
      return "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200";
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const triggerExit = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );
    // Complete remove 300ms after exit animation starts
    setTimeout(() => {
      removeToast(id);
    }, 300);
  }, [removeToast]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, isExiting: false };

    setToasts((prev) => [...prev, newToast]);

    // Trigger exit animation after 3200ms, remove completely at 3500ms
    setTimeout(() => {
      triggerExit(id);
    }, 3200);
  }, [triggerExit]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Wrapper */}
      <div className="fixed top-6 right-6 z-50 space-y-3 w-full max-w-sm pointer-events-none px-4 md:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${getToastStyles(
              toast.type
            )} ${toast.isExiting ? "animate-toast-out" : "animate-toast-in"}`}
          >
            <div className="flex items-start">
              <ToastIcon type={toast.type} />
              <p className="text-sm font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => triggerExit(toast.id)}
              className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
