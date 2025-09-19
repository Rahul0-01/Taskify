import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, LockClosedIcon, ArrowRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'; // Using solid icons
import api from '../api';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error message
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state
    console.log("API instance:", api);
    

    try {
     const response = await api.post('/users/login', {
  userName: username,
  userPassword: password,
});
 console.log("Login response =>", response.data); 

     const { accessToken, refreshToken, roles } = response.data;

  // �� correct keys save karo
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("roles", JSON.stringify(roles));
  
      // Optional: Add a slight delay for visual feedback before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 300); // 300ms delay

    } catch (err) {
      console.error("Login Failed:", err);
      // Try to get a specific error message from the response, fallback to generic
      setError(err.response?.data?.message || 'Login failed! Invalid credentials.');
    } finally {
      setIsLoading(false); // Reset loading state regardless of success/failure
    }
  };

  // Animation Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 120,
        damping: 10,
        when: "beforeChildren", // Ensure container animates before children
        staggerChildren: 0.1 // Stagger animation of children
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-4 overflow-hidden">
      {/* Optional: Add subtle animated background shapes if desired */}
      {/* <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden"> ... shapes ... </div> */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
      >
        {/* App Title/Logo */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700"
        >
          Welcome to Taskify
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <motion.div variants={itemVariants} className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // Add basic HTML validation
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              aria-label="Username"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Add basic HTML validation
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              aria-label="Password"
            />
          </motion.div>

          {/* Error Message Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
            >
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading} // Disable button when loading
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out ${
                isLoading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl'
              }`}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                // Simple spinner SVG
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArrowRightIcon className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Logging In...' : 'Login'}
            </motion.button>
          </motion.div>
        </form>

        {/* Optional: Links for Sign Up / Forgot Password */}
        {/* <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
          <p className="mt-2">
            <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </p>
        </motion.div> */}
      </motion.div>
    </div>
  );
};

export default Login;