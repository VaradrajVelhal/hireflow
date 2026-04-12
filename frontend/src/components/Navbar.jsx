import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", show: true },
    { name: "Jobs", path: "/jobs", show: !!token },
    { name: "Applications", path: "/applications", show: !!token },
    { name: "Dashboard", path: "/dashboard", show: !!token },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 shrink-0 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
            HireFlow
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center bg-slate-900/50 p-1 rounded-2xl border border-slate-800/50">
          {navLinks.filter(link => link.show).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                location.pathname === link.path
                  ? "bg-slate-800 text-indigo-400 shadow-sm"
                  : "text-slate-400 hover:text-indigo-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          {token ? (
            <button 
              onClick={handleLogout} 
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-5 py-2 rounded-xl font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 hover:-translate-y-0.5"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


