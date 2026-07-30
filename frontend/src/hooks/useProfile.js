import { useState, useEffect, useCallback } from "react";
import profileService from "../services/profileService";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook to manage fetching and deleting user profile and resume data.
 */
export function useProfile() {
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(err.response?.data?.error || "Failed to load profile details.");
      showToast("Failed to load profile details.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteCurrentResume = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await profileService.deleteResume();
      showToast(res.message || "Resume deleted successfully.", "success");
      await fetchProfileData();
      return true;
    } catch (err) {
      console.error("Delete resume error:", err);
      const errMsg = err.response?.data?.error || "Failed to delete resume.";
      showToast(errMsg, "error");
      return false;
    } finally {
      setDeleting(false);
    }
  }, [showToast, fetchProfileData]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    profileData,
    loading,
    deleting,
    error,
    refetch: fetchProfileData,
    deleteCurrentResume,
  };
}

export default useProfile;
