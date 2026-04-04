import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="font-bold text-lg">HireFlow</h1>

      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/jobs">Jobs</Link>
            <Link to="/applications">Applications</Link>
            <Link to="/dashboard">Dashboard</Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
