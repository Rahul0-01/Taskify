import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Import icons for buttons
import { ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import YourPageWrapper from "../YourPageWrapper";

// Component for background shapes/aurora effect
const BackgroundElement = ({ initialX, initialY, size, colors, delay }) => {
  return (
    <motion.div
      className={`absolute rounded-full mix-blend-hard-light filter blur-3xl opacity-40 md:opacity-50 ${size}`}
      style={{
        background: `radial-gradient(circle, ${colors[0]}, ${colors[1]})`,
        // Use Framer Motion for animation instead of CSS keyframes for easier control
      }}
      initial={{ x: initialX, y: initialY, scale: 0.8, opacity: 0 }}
      animate={{
        x: [initialX, initialX + 20, initialX - 20, initialX], // Subtle movement
        y: [initialY, initialY - 30, initialY + 10, initialY],
        scale: [0.8, 1, 1.1, 0.8], // Subtle pulse
        opacity: [0, 0.5, 0.6, 0.4, 0], // Fade in and loop subtly (adjust opacity as needed)
        rotate: [0, 10, -5, 0],
      }}
      transition={{
        duration: 20 + Math.random() * 10, // Long random duration
        repeat: Infinity,
        repeatType: 'reverse', // Go back and forth
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
};


const Home = () => {
  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Stagger animation of children
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

   const buttonHover = {
    scale: 1.1,
    boxShadow: "0px 0px 15px rgba(255, 255, 255, 0.3)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
  const buttonTap = { scale: 0.95 }


  return (
    <YourPageWrapper>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-950 text-white p-6 overflow-hidden relative">
      {/* Background Elements Layer */}
      <div className="absolute inset-0 z-0">
         <BackgroundElement initialX="-20%" initialY="10%" size="w-72 h-72 md:w-96 md:h-96" colors={['rgba(139, 92, 246, 0.5)', 'rgba(79, 70, 229, 0.3)']} delay={0} />
         <BackgroundElement initialX="70%" initialY="30%" size="w-60 h-60 md:w-80 md:h-80" colors={['rgba(59, 130, 246, 0.4)', 'rgba(99, 102, 241, 0.2)']} delay={2} />
         <BackgroundElement initialX="20%" initialY="70%" size="w-52 h-52 md:w-72 md:h-72" colors={['rgba(167, 139, 250, 0.4)', 'rgba(129, 140, 248, 0.3)']} delay={4} />
      </div>


      {/* Content Layer */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Gradient Header */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
        >
          Welcome to Taskify
        </motion.h1>

        {/* Animated Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-indigo-200 mb-12 max-w-xl lg:max-w-2xl leading-relaxed"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }} // Subtle text shadow for readability
        >
          The ultimate fusion of simplicity and power. Organize your life, achieve your goals, and unleash your productivity like never before.
        </motion.p>

        {/* Navigation Buttons with Icons and Animations */}
        <motion.div
          variants={itemVariants} // Also animate the container for buttons
          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
        >
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
             <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Login
            </Link>
          </motion.div>

          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <UserPlusIcon className="h-5 w-5" />
              Register
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
    </YourPageWrapper>
  );
};

export default Home;