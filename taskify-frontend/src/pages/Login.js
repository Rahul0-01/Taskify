import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8080/users/login',
        { userName: username, userPassword: password },
        { withCredentials: true }
      );
      const { token, roles } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('roles', JSON.stringify(roles));
      

      

      navigate('/dashboard');
    } catch (error) {
      console.error("Login Failed:", error);
      alert('Login failed! Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Welcome to Taskify
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-700 text-white py-2 rounded-md hover:bg-indigo-800 transition"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
