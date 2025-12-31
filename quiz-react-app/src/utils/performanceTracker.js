/**
 * Performance Tracker Utility
 * Manages quiz performance data in localStorage
 */

const STORAGE_KEY = "quiz_performance_history";

/**
 * Get performance history for a specific quiz
 * @param {string} quizName - Name of the quiz file
 * @returns {Array} Array of performance records
 */
export const getQuizHistory = (quizName) => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    const allHistory = history ? JSON.parse(history) : {};
    return allHistory[quizName] || [];
  } catch (error) {
    console.error("Error reading quiz history:", error);
    return [];
  }
};

/**
 * Save a new quiz attempt
 * @param {string} quizName - Name of the quiz file
 * @param {number} score - Score achieved
 * @param {number} totalQuestions - Total number of questions
 * @returns {Object} The saved performance record
 */
export const saveQuizAttempt = (quizName, score, totalQuestions) => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    const allHistory = history ? JSON.parse(history) : {};

    if (!allHistory[quizName]) {
      allHistory[quizName] = [];
    }

    const newAttempt = {
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      timestamp: new Date().toISOString(),
      attemptNumber: allHistory[quizName].length + 1,
    };

    allHistory[quizName].push(newAttempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));

    return newAttempt;
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return null;
  }
};

/**
 * Calculate performance rating based on percentage score
 * @param {number} percentage - Score percentage
 * @returns {Object} Rating object with level, message, and color
 */
export const getPerformanceRating = (percentage) => {
  if (percentage >= 90) {
    return {
      level: "Excellent",
      message:
        "Outstanding! You are definitely safe to continue to the next topic.",
      safety: "SAFE",
      color: "#4caf50",
      emoji: "🌟",
    };
  } else if (percentage >= 80) {
    return {
      level: "Very Good",
      message: "Great job! You have a strong understanding. Safe to proceed.",
      safety: "SAFE",
      color: "#8bc34a",
      emoji: "✅",
    };
  } else if (percentage >= 70) {
    return {
      level: "Good",
      message:
        "Good work! You can continue, but consider reviewing weak areas.",
      safety: "MOSTLY SAFE",
      color: "#ffc107",
      emoji: "👍",
    };
  } else if (percentage >= 60) {
    return {
      level: "Fair",
      message:
        "Fair performance. Review the material before moving to the next topic.",
      safety: "CAUTION",
      color: "#ff9800",
      emoji: "⚠️",
    };
  } else {
    return {
      level: "Needs Improvement",
      message:
        "Not safe to continue yet. Please review the material and try again.",
      safety: "NOT SAFE",
      color: "#f44336",
      emoji: "❌",
    };
  }
};

/**
 * Calculate improvement trend
 * @param {Array} history - Array of performance records
 * @returns {Object} Trend information
 */
export const calculateTrend = (history) => {
  if (history.length < 2) {
    return {
      trend: "neutral",
      message: "Complete more attempts to see your trend.",
    };
  }

  const recentAttempts = history.slice(-3);
  const scores = recentAttempts.map((a) => a.percentage);

  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const improvement = lastScore - firstScore;

  if (improvement > 10) {
    return {
      trend: "improving",
      message: "Great progress! Keep it up! 📈",
      color: "#4caf50",
    };
  } else if (improvement < -10) {
    return {
      trend: "declining",
      message: "Your scores are declining. Take a break and review. 📉",
      color: "#f44336",
    };
  } else {
    return {
      trend: "stable",
      message: "Your performance is stable. ➡️",
      color: "#2196f3",
    };
  }
};

/**
 * Clear history for a specific quiz
 * @param {string} quizName - Name of the quiz file
 */
export const clearQuizHistory = (quizName) => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    const allHistory = history ? JSON.parse(history) : {};

    if (allHistory[quizName]) {
      delete allHistory[quizName];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    }
  } catch (error) {
    console.error("Error clearing quiz history:", error);
  }
};

/**
 * Get statistics for the current quiz
 * @param {Array} history - Array of performance records
 * @returns {Object} Statistics object
 */
export const getStatistics = (history) => {
  if (history.length === 0) {
    return {
      attempts: 0,
      averageScore: 0,
      bestScore: 0,
      lastScore: 0,
    };
  }

  const scores = history.map((h) => h.percentage);
  const sum = scores.reduce((a, b) => a + b, 0);

  return {
    attempts: history.length,
    averageScore: Math.round(sum / scores.length),
    bestScore: Math.max(...scores),
    lastScore: scores[scores.length - 1],
  };
};

