import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function Register() {
  // const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setError("");
    setSuccess("");

    try {
      const res = await API.post("register/", form);
      setSuccess(res.data.message || "Registration successful. Please check your email to verify your account.");
    } catch (err) {
      console.error(err);
      let errorMsg = "Registration failed. Please check your details.";
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const errors = data[firstKey];
            if (Array.isArray(errors) && errors.length > 0) {
              errorMsg = errors[0];
            } else if (typeof errors === "string") {
              errorMsg = errors;
            }
          }
        } else if (typeof data === "string") {
          errorMsg = data;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="card sm:p-8 p-6 shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">Join the HireFlow community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-bold flex items-center animate-in fade-in duration-300">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success} <Link to="/login" className="underline underline-offset-2 text-emerald-700 dark:text-emerald-300 ml-1">Go to Sign In →</Link></span>
              </div>
            )}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold flex items-center animate-in fade-in duration-300">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="Choose a username"
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
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

            <div>
              <label className="block text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                placeholder="••••••••"
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-black disabled:opacity-70 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
