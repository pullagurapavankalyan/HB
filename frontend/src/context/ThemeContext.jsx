import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Determine the style properties based on theme
    const rootStyle = document.documentElement.style;
    if (theme === 'light') {
      rootStyle.setProperty('--bg-color', '#ffffff');
      rootStyle.setProperty('--text-color', '#333333');
      rootStyle.setProperty('--primary-color', '#0066cc');
      rootStyle.setProperty('--secondary-bg', '#e6f2ff');
      rootStyle.setProperty('--navbar-bg', '#ffffff');
      rootStyle.setProperty('--card-bg', '#f8f9fa');
      rootStyle.setProperty('--border-color', '#dee2e6');
      rootStyle.setProperty('--accent-color', '#005bb5');
    } else {
      rootStyle.setProperty('--bg-color', '#121212');
      rootStyle.setProperty('--text-color', '#e0e0e0');
      rootStyle.setProperty('--primary-color', '#3399ff');
      rootStyle.setProperty('--secondary-bg', '#001f3f');
      rootStyle.setProperty('--navbar-bg', '#1a1a1a');
      rootStyle.setProperty('--card-bg', '#1e1e1e');
      rootStyle.setProperty('--border-color', '#333333');
      rootStyle.setProperty('--accent-color', '#66b2ff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
