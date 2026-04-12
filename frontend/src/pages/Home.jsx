import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative pt-24 pb-40 overflow-hidden bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800 text-sm font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Now with AI Match Scoring
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Land your dream job <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">faster than ever.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The ultimate job tracking and discovery platform. Aggregate listings, 
            automate follow-ups, and get smart insights to boost your career trajectory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            {token ? (
              <Link to="/dashboard" className="btn btn-primary px-10 py-4 text-lg w-full sm:w-auto">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary px-10 py-4 text-lg w-full sm:w-auto">
                Get Started for Free
              </Link>
            )}
            <Link to="/jobs" className="btn btn-secondary px-10 py-4 text-lg w-full sm:w-auto">
              Explore Openings
            </Link>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 dark:opacity-40 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-400 dark:bg-indigo-600 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 dark:bg-blue-600 rounded-full blur-[140px] animate-pulse"></div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Precision Job Tracking</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Sophisticated tools designed for the modern job seeker.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
              title="Global Discovery"
              description="Unified feed aggregating the best opportunities from top-tier platforms."
              color="indigo"
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
              title="Active Pipeline"
              description="Monitor every stage from 'Saved' to 'Offer' with millisecond accuracy."
              color="emerald"
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Career Analytics"
              description="Data-driven insights to optimize your application-to-interview ratio."
              color="rose"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-16 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl dark:text-white">HireFlow</span>
          </div>
          <div className="text-slate-500 dark:text-slate-500 text-sm font-medium">
            &copy; 2026 HireFlow Enterprise. Built for excellence.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  const colorMaps = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50",
    emerald: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50",
    rose: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50",
  };

  return (
    <div className="group p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
      <div className={`w-20 h-20 ${colorMaps[color]} rounded-3xl flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform duration-500`}>
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{description}</p>
    </div>
  );
}

export default Home;
