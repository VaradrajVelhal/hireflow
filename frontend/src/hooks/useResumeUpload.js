import { useState } from "react";
import profileService from "../services/profileService";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook to manage the state and logic for uploading a resume PDF.
 */
export function useResumeUpload() {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Validates and sets the selected file.
   * @param {File} selectedFile 
   */
  const handleFileSelect = (selectedFile) => {
    setError(null);
    setProgress(0);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      showToast("Only PDF files are supported.", "error");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  /**
   * Uploads the selected file.
   * @param {Function} [onSuccess] - Optional callback triggered on successful upload
   */
  const uploadCurrentFile = async (onSuccess) => {
    if (!file) {
      setError("Please select a file first.");
      showToast("Please select a file first.", "error");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      await profileService.uploadResume(file, (percent) => {
        setProgress(percent);
      });
      showToast("Resume uploaded successfully!", "success");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.resume?.[0] || "Failed to upload resume. Please try again.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Clears the current file and related states.
   */
  const clearFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  return {
    file,
    uploading,
    progress,
    error,
    handleFileSelect,
    uploadCurrentFile,
    clearFile,
  };
}

export default useResumeUpload;
