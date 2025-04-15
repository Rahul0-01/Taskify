// src/ThemeProvider.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();



console.log("ThemeProvider FILE loaded");


const ThemeProvider = ({ children }) => {
  // Start with 'system' so we can handle the “original” default
  const [theme, setTheme] = useState('system');

  // On mount, read the saved theme (if any), otherwise leave as 'system'
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      setTheme(saved);
    }
  }, []);

  // Whenever theme changes, update <html> classes and save
  useEffect(() => {
    const root = document.documentElement;

    // Clear both classes first
    root.classList.remove('dark', 'light');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    }
    // if theme === 'system', we leave it unstyled (original default)

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
