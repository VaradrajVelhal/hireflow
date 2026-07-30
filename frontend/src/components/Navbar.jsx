import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", show: true },
    { name: "Jobs", path: "/jobs", show: !!token },
    { name: "Profile", path: "/profile", show: !!token },
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
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative group/link ${
                location.pathname === link.path
                  ? "bg-indigo-600/10 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                  : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50"
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="h-6 w-px bg-slate-700 mx-1"></div>

          {token ? (
            <button 
              onClick={handleLogout} 
              className="bg-transparent border border-slate-700 hover:border-rose-600/30 hover:bg-rose-600/10 text-slate-300 hover:text-rose-500 text-sm px-5 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
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

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-800/80 space-y-3 pb-2 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/60 px-4">
            {token ? (
              <button 
                onClick={handleLogout} 
                className="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/30 text-base py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-base font-semibold text-slate-300 hover:text-indigo-400 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-base py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;


