import API from "../api/axios";

/**
 * Service for handling profile-related API calls: resume upload and job matching.
 */
const profileService = {
  /**
   * Upload a resume PDF to the backend.
   * @param {File} file - The PDF file object
   * @param {Function} [onProgress] - Optional progress callback function
   * @returns {Promise<any>}
   */
  uploadResume: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await API.post("profile/resume/", formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Match the uploaded resume with a specific job.
   * @param {number} jobId - The unique identifier of the job
   * @param {Object} [config] - Optional request config parameters
   * @returns {Promise<any>}
   */
  matchResume: async (jobId, config = {}) => {
    const response = await API.post("profile/match/", {
      job_id: jobId,
    }, config);
    return response.data;
  },

  /**
   * Fetch authenticated user details and active resume metadata.
   * @returns {Promise<any>}
   */
  getProfile: async () => {
    const response = await API.get("profile/");
    return response.data;
  },

  /**
   * Delete the uploaded resume PDF and clear text content.
   * @returns {Promise<any>}
   */
  deleteResume: async () => {
    const response = await API.delete("profile/resume/");
    return response.data;
  },
};

export default profileService;
