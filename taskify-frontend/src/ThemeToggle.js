import React, { useContext } from 'react';
import { ThemeContext } from './ThemeProvider'; // Import the context

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext); // Get the current theme and setTheme function

  // Function to handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme); // Set the new theme
  };

  return (
    <div>
      <button onClick={() => handleThemeChange('light')} className="p-2 m-2">
        Light Mode
      </button>
      <button onClick={() => handleThemeChange('dark')} className="p-2 m-2">
        Dark Mode
      </button>
      <button onClick={() => handleThemeChange('system')} className="p-2 m-2">
        System Mode
      </button>
    </div>
  );
};

export default ThemeToggle;
