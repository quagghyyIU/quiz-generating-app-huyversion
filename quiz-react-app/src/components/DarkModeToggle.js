import React from "react";
import { useTheme } from "../ThemeContext";
import "../css/DarkModeToggle.css";

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className="dark-mode-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <span className="toggle-icon">{isDarkMode ? "☀️" : "🌙"}</span>
    </button>
  );
};

export default DarkModeToggle;
