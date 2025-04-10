import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const handleLogout = () => {
    localStorage.clear();
    alert("You have been logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gray-100 shadow-md">
      <h1 className="text-xl font-bold text-purple-700">Taskify</h1>
      <div className="space-x-6">
        <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
          Home
        </Link>

        {!token && (
          <Link to="/login" className="text-gray-700 hover:text-purple-600 transition-colors">
            Login
          </Link>
        )}

        {token && (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/tasks" className="text-gray-700 hover:text-purple-600 transition-colors">
              Tasks
            </Link>
            {roles.includes("ADMIN") && (
              <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition-colors">
                Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="text-red-500 font-semibold hover:underline">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
