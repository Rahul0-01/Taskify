import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UsersIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Or solid
import YourPageWrapper from "../YourPageWrapper";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null); // Track which user is being deleted

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const token = localStorage.getItem("token");
        if (!token) {
           throw new Error("Authentication token not found.");
        }
        const res = await axios.get("http://localhost:8080/users/allUsers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched users:", res.data);
        // Ensure we are setting an array, provide fallback
        setUsers(Array.isArray(res.data.body) ? res.data.body : []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch users. Please check console.");
        setUsers([]); // Ensure users is an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleString(undefined, { // Use locale default
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
  };


  const handleDelete = async (userId) => {
    // Keep confirm for simplicity, but a modal would be better UX
    const confirmDelete = window.confirm(`Are you sure you want to delete user ID: ${userId}? This action cannot be undone.`);
    if (!confirmDelete) return;

    setDeletingUserId(userId); // Set loading state for this specific button
    setError(null); // Clear previous errors

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      await axios.delete(`http://localhost:8080/users/DeleteUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // alert("User deleted successfully!"); // Replace alert with optimistic UI update
      setUsers(currentUsers => currentUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete user.");
      // Consider showing error via toast notification for better UX
      alert("Failed to delete user. " + (err.response?.data?.message || err.message || ""));
    } finally {
      setDeletingUserId(null); // Reset loading state for the button
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }, // Stagger row appearance
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };


  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-10">
      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="ml-3 text-gray-600">Loading Users...</p>
    </div>
  );

  // Error Message Component
  const ErrorDisplay = ({ message }) => (
     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center my-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{message}</span>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md mt-6">
      <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">No Users Found</h3>
      <p className="mt-1 text-sm text-gray-500">There are currently no registered users to display.</p>
    </div>
  );

  return (

    <YourPageWrapper>
   
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 sm:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto" // Constrain width on large screens
      >
        {/* Enhanced Title */}
        <div className="flex items-center gap-3 mb-8">
           <UsersIcon className="h-8 w-8 text-indigo-600"/>
           <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        </div>

        {/* Display Error if any */}
        {error && !isLoading && <ErrorDisplay message={error} />}

        {/* Table Container with enhanced styling */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {isLoading ? (
            <LoadingSpinner />
          ) : users.length === 0 && !error ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <motion.table
                 variants={tableVariants}
                 initial="hidden"
                 animate="visible"
                 className="min-w-full divide-y divide-gray-200"
               >
                <thead className="bg-gray-50">
                  <tr>
                    {/* Enhanced Header Cells */}
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      variants={rowVariants}
                      className="hover:bg-gray-50/80 transition-colors duration-150" // Subtle hover
                    >
                      {/* Enhanced Data Cells */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-medium">
                        <Link to={`/admin/users/${user.id}`} className="hover:underline hover:text-indigo-900 transition-colors">
                          {user.userName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingUserId === user.id} // Disable button during delete operation
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition duration-150 ease-in-out ${
                            deletingUserId === user.id
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                          aria-label={`Delete user ${user.userName}`}
                        >
                          {deletingUserId === user.id ? (
                             <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
     </YourPageWrapper>
  );
}

export default AdminPage;