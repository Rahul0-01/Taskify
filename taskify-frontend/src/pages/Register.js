import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Using outline icons for a lighter feel
import YourPageWrapper from "../YourPageWrapper";
const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // State for success message
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true); // State for password match UI
  const navigate = useNavigate();

  // Effect to check password match
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true); // Reset if fields are empty
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!passwordsMatch) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/register', {
        userName: username,
        password: password,
        email: email,
      });
      setSuccess('Registration successful! Redirecting to login...'); // Set success message
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 200);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      // Don't set loading false immediately if successful, wait for redirect
      if (!success) {
         setIsLoading(false);
      }
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1, // Stagger children appearance
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const inputFocusAnimation = {
    scale: 1.02,
    borderColor: 'rgba(34, 197, 94, 0.7)', // Emerald-500 with opacity
    boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)', // Subtle glow
    transition: { duration: 0.2 }
  };

  const buttonHoverAnimation = {
    scale: 1.05,
    boxShadow: '0px 10px 25px rgba(14, 165, 233, 0.4)', // Cyan-500 shadow
    transition: { type: 'spring', stiffness: 300, damping: 15 }
  };

  const buttonTapAnimation = {
    scale: 0.95
  };


  return (
    <YourPageWrapper>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-600 p-4 overflow-hidden relative">
       {/* Subtle Background Blobs (Optional) */}
       <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-lime-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
       <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
       <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/70 backdrop-blur-lg p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
      >
        {/* Animated Title */}
        <motion.h2
          variants={itemVariants}
          className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-700"
        >
          Create Your Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <motion.div variants={itemVariants} className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-emerald-500 transition-colors duration-300" />
            <motion.input
              whileFocus={inputFocusAnimation}
              type="text"
              placeholder="Choose a Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="peer w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-emerald-500 transition duration-300"
              aria-label="Username"
            />
          </motion.div>

          {/* Email Input */}
          <motion.div variants={itemVariants} className="relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-emerald-500 transition-colors duration-300" />
            <motion.input
              whileFocus={inputFocusAnimation}
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-emerald-500 transition duration-300"
              aria-label="Email"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="relative">
            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-emerald-500 transition-colors duration-300" />
            <motion.input
              whileFocus={inputFocusAnimation}
              type="password"
              placeholder="Create a Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`peer w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border placeholder-gray-500 focus:outline-none focus:ring-0 transition duration-300 ${
                !passwordsMatch && confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
              }`}
              aria-label="Password"
            />
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div variants={itemVariants} className="relative">
            <LockClosedIcon className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${!passwordsMatch && confirmPassword ? 'text-red-500' : 'text-gray-400 peer-focus:text-emerald-500'}`} />
            <motion.input
              whileFocus={inputFocusAnimation}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`peer w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border placeholder-gray-500 focus:outline-none focus:ring-0 transition duration-300 ${
                !passwordsMatch && confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
              }`}
              aria-label="Confirm Password"
            />
             {/* Password Match Indicator Icon (Subtle) */}
             {password && confirmPassword && (
                passwordsMatch
                    ? <CheckCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    : <ExclamationTriangleIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
             )}
          </motion.div>

          {/* Feedback Messages Area */}
          <div className="h-6 text-center"> {/* Reserve space to prevent layout shift */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center text-sm text-red-600"
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center text-sm text-green-600"
              >
                <CheckCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={isLoading || success ? {} : buttonHoverAnimation} // Don't animate hover if disabled/success
              whileTap={isLoading || success ? {} : buttonTapAnimation} // Don't animate tap if disabled/success
              type="submit"
              disabled={isLoading || success} // Disable button when loading or on success
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold text-lg bg-gradient-to-r from-emerald-500 to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-300 ease-in-out ${
                isLoading || success
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:from-emerald-600 hover:to-cyan-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : success ? (
                 <>
                  <CheckCircleIcon className="h-5 w-5 mr-2"/>
                  Success!
                 </>
              ) : (
                <>
                  Register
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Login Link */}
        <motion.p variants={itemVariants} className="text-sm text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-sky-700 hover:underline transition duration-200">
            Sign In
          </Link>
        </motion.p>
      </motion.div>

      {/* Add Tailwind CSS for blob animation if not already globally defined */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  </YourPageWrapper>
  );
};

export default Register;