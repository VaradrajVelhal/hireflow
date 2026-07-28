import { useEffect, useState } from "react";
import API from "../api/axios";

function Dashboard() {
  const [data, setData] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    rejected: 0
  });
  const [dueToday, setDueToday] = useState(0);
  const [dueApplications, setDueApplications] = useState([]);
  const [overdueApplications, setOverdueApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get("dashboard/"),
      API.get("due-today/")
    ])
      .then(([dashRes, dueRes]) => {
        setData(dashRes.data);
        setDueToday(dueRes.data.count);
        setDueApplications(dueRes.data.applications || []);
        setOverdueApplications(dueRes.data.overdue_applications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getFollowUpMessage = (app, isOverdue) => {
    if (isOverdue) {
      return `Follow-up was due ${app.follow_up_date}`;
    }
    if (app.status === "applied") {
      return "Follow up on your application today";
    }
    if (app.status === "interview") {
      return "Follow up regarding your interview today";
    }
    return "Follow-up scheduled for today";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-12 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">Job Search Overview</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
          Real-time metrics and insights into your job search.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Applications" 
          value={data.total} 
          color="indigo"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
          description="Total tracked applications"
        />
        <StatCard 
          label="Applied" 
          value={data.applied} 
          color="blue"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
          description="Applications submitted"
        />
        <StatCard 
          label="Interviews" 
          value={data.interview} 
          color="emerald"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          description="Next stage active"
        />
        <StatCard 
          label="Follow-ups" 
          value={dueToday} 
          color="rose"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
          highlight={dueToday > 0}
          description="Tasks due today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
        <div className="lg:col-span-3 card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Follow-up Tasks</h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Action Required</span>
          </div>

          {dueApplications.length === 0 && overdueApplications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-950 dark:text-white font-bold text-base">No follow-ups due today</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center px-4">
                You're all caught up. Scheduled follow-ups will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {/* Today's Tasks */}
              {dueApplications.map((app) => (
                <div key={app.id} className="p-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                        {app.status}
                      </span>
                      {app.applied_via && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          via {app.applied_via}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {app.job?.title} at <span className="text-indigo-600 dark:text-indigo-400">{app.job?.company}</span>
                    </h4>
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFollowUpMessage(app, false)}
                    </p>
                  </div>
                  <a
                    href="/applications"
                    className="btn btn-secondary text-xs py-2 px-4 shrink-0 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600"
                  >
                    View Application
                  </a>
                </div>
              ))}

              {/* Overdue Tasks */}
              {overdueApplications.map((app) => (
                <div key={app.id} className="p-5 bg-rose-50/10 dark:bg-rose-950/5 rounded-2xl border border-rose-100/45 dark:border-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rose-100 dark:hover:border-rose-900/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                        OVERDUE
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {app.status}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {app.job?.title} at <span className="text-rose-600 dark:text-rose-400">{app.job?.company}</span>
                    </h4>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {getFollowUpMessage(app, true)}
                    </p>
                  </div>
                  <a
                    href="/applications"
                    className="btn btn-secondary text-xs py-2 px-4 shrink-0 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:border-rose-600"
                  >
                    View Application
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card p-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Application Health</h3>
          <div className="space-y-6">
            <HealthBar label="Applied" current={data.applied} total={data.total} color="blue" />
            <HealthBar label="Interviews" current={data.interview} total={data.total} color="emerald" />
            <HealthBar label="Rejected" current={data.rejected} total={data.total} color="rose" />
          </div>
          
          <div className="mt-10 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <h4 className="text-indigo-900 dark:text-indigo-300 font-bold mb-1">Weekly Tip</h4>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm leading-relaxed">
              Keep your follow-up dates updated so you don't lose track of active applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, highlight, description }) {
  const colorClasses = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800",
  }[color];

  return (
    <div className={`p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 group ${highlight ? 'ring-2 ring-rose-500 ring-offset-4 dark:ring-offset-slate-950' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform ${colorClasses}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        {highlight && (
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[2px]">{label}</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white mt-2 font-mono">{value}</p>
        <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{description}</p>
      </div>
    </div>
  );
}

function HealthBar({ label, current, total, color }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const barColors = {
    blue: "bg-blue-500 shadow-blue-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    rose: "bg-rose-500 shadow-rose-500/20",
  }[color];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${barColors}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Dashboard;
