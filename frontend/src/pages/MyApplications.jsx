import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";

function MyApplications() {
  const { showToast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Add Application State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [addForm, setAddForm] = useState({
    title: "",
    company: "",
    location: "",
    apply_link: "",
    status: "saved",
    applied_date: "",
    follow_up_date: "",
    applied_via: "LinkedIn",
    notes: ""
  });

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchApplications = useCallback(() => {
    setLoading(true);
    API.get("my-applications/")
      .then((res) => setApps(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleEdit = (app) => {
    setEditingApp({ ...app });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const payload = {
        ...editingApp,
        job: editingApp.job?.id || editingApp.job,
      };
      await API.put(`application/${editingApp.id}/`, payload);
      setIsModalOpen(false);
      fetchApplications();
      showToast("Application updated successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update application. Please try again.", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddErrors({});

    const errors = {};
    if (!addForm.title.trim()) {
      errors.title = "Job title is required.";
    }
    if (!addForm.company.trim()) {
      errors.company = "Company name is required.";
    }
    if (!addForm.status) {
      errors.status = "Application status is required.";
    }
    if (addForm.status !== "saved" && !addForm.applied_date) {
      errors.applied_date = "Applied date is required for this status.";
    }
    if (addForm.applied_date && addForm.follow_up_date) {
      if (addForm.follow_up_date < addForm.applied_date) {
        errors.follow_up_date = "Follow-up date cannot be before applied date.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      setAddLoading(false);
      return;
    }

    try {
      const payload = {
        ...addForm,
        applied_date: addForm.applied_date || null,
        follow_up_date: addForm.follow_up_date || null,
      };
      await API.post("applications/manual/", payload);
      setAddForm({
        title: "",
        company: "",
        location: "",
        apply_link: "",
        status: "saved",
        applied_date: "",
        follow_up_date: "",
        applied_via: "LinkedIn",
        notes: ""
      });
      setIsAddModalOpen(false);
      fetchApplications();
      showToast("Application added successfully.", "success");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          const fieldErrors = {};
          Object.keys(data).forEach((key) => {
            const val = data[key];
            fieldErrors[key] = Array.isArray(val) ? val[0] : val;
          });
          setAddErrors(fieldErrors);
        } else if (typeof data === "string") {
          setAddErrors({ general: data });
        } else {
          setAddErrors({ general: "Failed to add application. Please check your details." });
        }
      } else {
        setAddErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    setDeleteLoading(true);
    try {
      await API.delete(`application/delete/${appToDelete.id}/`);
      setIsDeleteModalOpen(false);
      setAppToDelete(null);
      fetchApplications();
      showToast("Application deleted successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete application. Please try again.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;
    setIsDeleteModalOpen(false);
    setAppToDelete(null);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "interview":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "rejected":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "saved":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-12 animate-pulse"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">My Applications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Track and manage your active job search pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary px-6 py-3 font-bold text-sm"
          >
            + Add Application
          </button>
          <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800 font-bold text-sm">
            {apps.length} active applications
          </div>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nothing tracked yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-sm mx-auto text-lg leading-relaxed">
            Track jobs you've applied to and manage your progress here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary px-8 cursor-pointer"
            >
              + Add Application
            </button>
            <Link to="/jobs" className="btn btn-secondary px-8">
              Explore Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`group relative overflow-hidden card p-8 border-2 transition-all duration-300 ${
                app.follow_up_date === today 
                ? "border-rose-200 dark:border-rose-900 shadow-xl shadow-rose-500/10 ring-4 ring-rose-500/5 bg-rose-50/10" 
                : "border-slate-100 dark:border-slate-800"
              }`}
            >
              {app.follow_up_date === today && (
                <div className="absolute top-0 right-0">
                  <div className="bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg">
                    Action Required Today
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4 w-full md:max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </span>
                    {app.job?.location && (
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider flex items-center bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
                        <svg className="w-3.5 h-3.5 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {app.job.location}
                      </span>
                    )}
                    {app.job?.apply_link && (
                      <a 
                        href={app.job.apply_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-black uppercase tracking-wider flex items-center bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/30 hover:underline"
                      >
                        <span>View Job Link</span>
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {app.job?.title || "Untitled Job"}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-base font-bold mt-0.5">
                      {app.job?.company || "Unknown Company"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    {app.applied_date && (
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <div className="p-2 rounded-xl mr-3 bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Applied</span>
                          <span className="text-slate-900 dark:text-slate-100 font-bold">
                            {app.applied_date}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <div className={`p-2 rounded-xl mr-3 ${app.follow_up_date === today ? "bg-rose-100 text-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Follow-up</span>
                        <span className={`font-bold ${app.follow_up_date === today ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
                          {app.follow_up_date || "Not set"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <div className="p-2 rounded-xl mr-3 bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Source</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{app.applied_via || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                        &quot;{app.notes}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEdit(app)}
                    className="btn btn-secondary text-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-900"
                  >
                    Edit Status
                  </button>
                  <button 
                    onClick={() => {
                      setAppToDelete(app);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800 cursor-pointer"
                    title="Delete Application"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Update Application Status"
      >
        {editingApp && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Status
              </label>
              <select
                className="input-field cursor-pointer"
                value={editingApp.status}
                onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value })}
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Follow-up Date
              </label>
              <input
                type="date"
                className="input-field"
                value={editingApp.follow_up_date || ""}
                onChange={(e) => setEditingApp({ ...editingApp, follow_up_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Notes
              </label>
              <textarea
                className="input-field min-h-[120px] resize-none"
                placeholder="Add any interview notes or application details..."
                value={editingApp.notes || ""}
                onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="btn btn-primary flex-1"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Application Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setAddErrors({});
        }}
        title="Add External Application"
      >
        <form onSubmit={handleAddSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {addErrors.general && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold flex items-center">
              <span>{addErrors.general}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineer"
                className="input-field"
                value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              />
              {addErrors.title && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Company *
              </label>
              <input
                type="text"
                placeholder="e.g. Google"
                className="input-field"
                value={addForm.company}
                onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
              />
              {addErrors.company && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.company}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote / London"
                className="input-field"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
              />
              {addErrors.location && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Job URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://linkedin.com/..."
                className="input-field"
                value={addForm.apply_link}
                onChange={(e) => setAddForm({ ...addForm, apply_link: e.target.value })}
              />
              {addErrors.apply_link && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.apply_link}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Status *
              </label>
              <select
                className="input-field cursor-pointer"
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
              </select>
              {addErrors.status && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Applied Date {addForm.status !== "saved" && "*"}
              </label>
              <input
                type="date"
                className="input-field"
                value={addForm.applied_date}
                onChange={(e) => setAddForm({ ...addForm, applied_date: e.target.value })}
              />
              {addErrors.applied_date && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.applied_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
                Follow-up Date
              </label>
              <input
                type="date"
                className="input-field"
                value={addForm.follow_up_date}
                onChange={(e) => setAddForm({ ...addForm, follow_up_date: e.target.value })}
              />
              {addErrors.follow_up_date && (
                <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.follow_up_date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
              Applied Via
            </label>
            <select
              className="input-field cursor-pointer"
              value={addForm.applied_via}
              onChange={(e) => setAddForm({ ...addForm, applied_via: e.target.value })}
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Company Website">Company Website</option>
              <option value="Referral">Referral</option>
              <option value="Campus Placement">Campus Placement</option>
              <option value="Indeed">Indeed</option>
              <option value="Other">Other</option>
            </select>
            {addErrors.applied_via && (
              <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.applied_via}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">
              Notes
            </label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="e.g. Applied via referral from X. Technical round next week."
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
            />
            {addErrors.notes && (
              <p className="text-xs text-rose-500 font-bold mt-1.5 ml-1">{addErrors.notes}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddErrors({});
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="btn btn-primary flex-1"
            >
              {addLoading ? "Adding..." : "Add Application"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={deleteLoading ? undefined : handleCloseDeleteModal}
        title="Delete Application"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete Application?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Are you sure you want to remove your application for{" "}
              <span className="font-black text-rose-600 dark:text-rose-400 block mt-1 text-base">
                &quot;{appToDelete?.job?.title} at {appToDelete?.job?.company}&quot;
              </span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pt-2">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleCloseDeleteModal}
              className="btn btn-secondary flex-1 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleDelete}
              className="btn btn-danger flex-1 cursor-pointer"
            >
              {deleteLoading ? "Deleting..." : "Delete Application"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MyApplications;
