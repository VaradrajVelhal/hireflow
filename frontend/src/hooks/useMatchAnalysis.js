import { useState, useCallback } from "react";
import profileService from "../services/profileService";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook to handle job matching analysis state and request trigger.
 */
export function useMatchAnalysis() {
  const { showToast } = useToast();
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const performAnalysis = useCallback(async (jobId, isRetry = false) => {
    async function doAnalysis(id, retry) {
      if (!id) return;

      if (!retry) {
        setStatus("loading");
        setError(null);
        setResult(null);
      }

      try {
        const data = await profileService.matchResume(id, { timeout: 30000 });
        setResult(data);
        setStatus("success");
        showToast("Resume analysis complete!", "success");
      } catch (err) {
        const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
        const isNetworkError = err.message?.includes("Network Error") || !err.response;
        const isTemporaryStatus = err.response?.status === 504 || err.response?.status === 503 || err.response?.status === 408;

        if (!retry && (isTimeout || isNetworkError || isTemporaryStatus)) {
          console.warn("Match analysis request failed temporarily. Retrying once...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return doAnalysis(id, true);
        }

        console.error("Match analysis error:", err);
        let errMsg = "AI service temporarily unavailable. Please try again.";
        if (isTimeout || err.response?.status === 504 || err.response?.status === 408) {
          errMsg = "Analysis took longer than expected. Please try again.";
        } else if (err.response?.data?.error) {
          errMsg = err.response.data.error;
        }
        
        setError(errMsg);
        setStatus("error");
        showToast(errMsg, "error");
      }
    }

    await doAnalysis(jobId, isRetry);
  }, [showToast]);

  const runAnalysis = useCallback(async (jobId) => {
    await performAnalysis(jobId, false);
  }, [performAnalysis]);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    runAnalysis,
    reset,
  };
}

export default useMatchAnalysis;
