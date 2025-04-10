import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      {/* Animated header */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold text-white mb-4"
      >
        Welcome to Taskify
      </motion.h1>
      
      {/* Animated subheading */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg text-gray-200 mb-8 text-center max-w-xl"
      >
        A powerful task management system designed to boost your productivity.
      </motion.p>
      
      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded transition-colors duration-200"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
