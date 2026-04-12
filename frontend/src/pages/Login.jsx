import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/jobs");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("login/", form);
      localStorage.setItem("token", res.data.access);
      navigate("/jobs");
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.data?.error === "email_not_verified") {
          setError("Please verify your email before logging in.");
        } else if (err.response.status === 401) {
          setError("Invalid credentials. Please try again.");
        } else {
          setError(err.response.data?.message || "Login failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="card p-10 shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">Please enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold flex items-center animate-in fade-in duration-300">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-3 ml-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="Enter your username"
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-3 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full btn btn-primary py-4 text-lg font-black disabled:opacity-70 mt-4"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 dark:text-slate-400 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">
              Join HireFlow
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
