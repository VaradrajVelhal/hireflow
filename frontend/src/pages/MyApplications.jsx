import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import Modal from "../components/Modal";

function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

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
      await API.put(`application/${editingApp.id}/`, editingApp);
      setIsModalOpen(false);
      fetchApplications();
      alert("Application updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update application");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this application?")) return;
    try {
      await API.delete(`application/delete/${id}/`);
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Failed to delete application");
    }
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
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800 font-bold">
          {apps.length} active applications
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
            Start applying to jobs to see your progress dashboard here.
          </p>
          <a href="/jobs" className="btn btn-primary mt-10 px-10">Explore Jobs</a>
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-bold flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16" />
                      </svg>
                      {app.job}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <div className={`p-2 rounded-xl mr-3 ${app.follow_up_date === today ? "bg-rose-100 text-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{app.applied_via}</span>
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
                    onClick={() => handleDelete(app.id)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
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
    </div>
  );
}

export default MyApplications;
